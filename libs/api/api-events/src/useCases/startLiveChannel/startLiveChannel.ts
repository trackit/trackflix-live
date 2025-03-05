import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenTaskTokensRepository,
} from '../../ports';
import { EventUpdateAction, LogType } from '@trackflix-live/types';
import { createInjectionToken, inject } from '@trackflix-live/di';

export interface StartLiveChannelParameters {
  eventId: string;
  packageChannelId: string;
  liveChannelArn: string;
  liveChannelId: string;
  taskToken: string;
}

export interface StartLiveChannelUseCase {
  startLiveChannel(params: StartLiveChannelParameters): Promise<void>;
}

export class StartLiveChannelUseCaseImpl implements StartLiveChannelUseCase {
  private readonly liveChannelsManager = inject(tokenLiveChannelsManager);

  private readonly taskTokensRepository = inject(tokenTaskTokensRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  private readonly eventsRepository = inject(tokenEventsRepository);

  public async startLiveChannel({
    liveChannelId,
    liveChannelArn,
    packageChannelId,
    eventId,
    taskToken,
  }: StartLiveChannelParameters): Promise<void> {
    throw new Error('test');
    const event = await this.eventsRepository.appendLogsToEvent(eventId, [
      {
        timestamp: Date.now(),
        type: LogType.LIVE_CHANNEL_CREATED,
      },
    ]);
    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: event,
    });

    await this.liveChannelsManager.startChannel({
      channelId: liveChannelId,
      eventId,
      onAirStartTime: event.onAirStartTime,
    });

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannelArn,
      expectedStatus: 'RUNNING',
      taskToken,
      output: {
        eventId,
        packageChannelId,
        liveChannelId,
        liveChannelArn,
      },
    });
  }
}

export const tokenStartLiveChannelUseCase =
  createInjectionToken<StartLiveChannelUseCase>('StartLiveChannelUseCase', {
    useClass: StartLiveChannelUseCaseImpl,
  });
