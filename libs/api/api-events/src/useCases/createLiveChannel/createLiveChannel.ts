import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenTaskTokensRepository,
  tokenElementalInferenceManager,
} from '../../ports';
import {
  EventEndpoint,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils';

export interface CreateLiveChannelParameters {
  eventId: string;
  packageChannelId: string;
  verticalPackageChannelId?: string;
  packageDomainName: string;
  verticalPackageDomainName?: string;
  taskToken: string;
  endpoints: EventEndpoint[];
}

export interface CreateLiveChannelResponse {
  channelId: string;
  channelArn: string;
  inputId: string;
  waitingInputId: string;
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

  private readonly elementalInferenceManager = inject(
    tokenElementalInferenceManager
  );

  public async createLiveChannel({
    eventId,
    packageChannelId,
    verticalPackageChannelId,
    packageDomainName,
    verticalPackageDomainName,
    taskToken,
    endpoints,
  }: CreateLiveChannelParameters): Promise<CreateLiveChannelResponse> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new EventDoesNotExistError();
    }

    const liveChannel = await this.liveChannelsManager.createChannel({
      eventId: eventId,
      source: event.source,
      packageChannelId,
      verticalPackageChannelId,
    });

    // Configuration of real-time smart cropping for this event
    await this.elementalInferenceManager.setupRealtimeCropping(
      liveChannel.channelArn
    );

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
        verticalPackageChannelId,
        packageDomainName,
        verticalPackageDomainName,
        liveChannelId: liveChannel.channelId,
        liveChannelArn: liveChannel.channelArn,
        endpoints,
      },
    });

    return liveChannel;
  }
}

export const tokenCreateLiveChannelUseCase =
  createInjectionToken<CreateLiveChannelUseCase>('CreateLiveChannelUseCase', {
    useClass: CreateLiveChannelUseCaseImpl,
  });
