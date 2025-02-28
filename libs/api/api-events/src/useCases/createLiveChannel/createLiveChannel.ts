import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenTaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface CreateLiveChannelParameters {
  eventId: string;
  packageChannelId: string;
  taskToken: string;
}

export interface CreateLiveChannelResponse {
  channelId: string;
  channelArn: string;
}

export interface CreateLiveChannelUseCase {
  createLiveChannel(
    params: CreateLiveChannelParameters
  ): Promise<CreateLiveChannelResponse>;
}

export class CreateLiveChannelUseCaseImpl implements CreateLiveChannelUseCase {
  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly liveChannelsManager = inject(tokenLiveChannelsManager);

  private readonly taskTokensRepository = inject(tokenTaskTokensRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async createLiveChannel({
    eventId,
    packageChannelId,
    taskToken,
  }: CreateLiveChannelParameters): Promise<CreateLiveChannelResponse> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }

    const liveChannel = await this.liveChannelsManager.createChannel({
      eventId: eventId,
      source: event.source,
      packageChannelId,
      onAirStartTime: event.onAirStartTime,
    });

    const currentTimestamp = Date.now();
    await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: currentTimestamp,
        type: LogType.LIVE_INPUT_CREATED,
      },
    ]);

    await this.eventsRepository.updateLiveChannelArn(
      eventId,
      liveChannel.channelArn
    );
    await this.eventsRepository.updateLiveChannelId(
      eventId,
      liveChannel.channelId
    );
    await this.eventsRepository.updateLiveInputId(eventId, liveChannel.inputId);
    const eventAfterUpdate =
      await this.eventsRepository.updateLiveWaitingInputId(
        eventId,
        liveChannel.waitingInputId
      );

    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannel.channelArn,
      expectedStatus: 'CREATED',
      taskToken,
      output: {
        eventId,
        packageChannelId,
        liveChannelId: liveChannel.channelId,
        liveChannelArn: liveChannel.channelArn,
      },
    });

    return liveChannel;
  }
}

export const tokenCreateLiveChannelUseCase =
  createInjectionToken<CreateLiveChannelUseCase>('CreateLiveChannelUseCase', {
    useClass: CreateLiveChannelUseCaseImpl,
  });
