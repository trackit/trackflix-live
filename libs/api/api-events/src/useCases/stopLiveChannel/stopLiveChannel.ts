import {
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenTaskTokensRepository,
} from '../../ports';
import { EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { createInjectionToken, inject } from 'di';
import { StopTransmissionUseCaseImpl } from '../stopTransmission';

export interface StopLiveChannelParameters {
  eventId: string;
  taskToken: string;
}

export interface StopLiveChannelUseCase {
  stopLiveChannel(params: StopLiveChannelParameters): Promise<void>;
}

export class StopLiveChannelUseCaseImpl implements StopLiveChannelUseCase {
  private readonly liveChannelsManager = inject(tokenLiveChannelsManager);

  private readonly taskTokensRepository = inject(tokenTaskTokensRepository);

  private readonly eventsRepository = inject(tokenEventsRepository);

  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async stopLiveChannel({
    eventId,
    taskToken,
  }: StopLiveChannelParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }
    if (
      event.liveChannelId === undefined ||
      event.liveChannelArn === undefined
    ) {
      throw new Error('Missing live channel ID or live channel ARN.');
    }

    const eventAfterUpdate = await this.eventsRepository.updateEventStatus(
      eventId,
      EventStatus.POST_TX
    );
    await this.eventUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_UPDATE,
      value: eventAfterUpdate,
    });

    const { liveChannelArn, liveChannelId } = event;

    await this.liveChannelsManager.stopChannel(liveChannelId);

    await this.taskTokensRepository.createTaskToken({
      channelArn: liveChannelArn,
      expectedStatus: 'STOPPED',
      taskToken,
      output: {
        eventId,
      },
    });
  }
}

export const tokenStopLiveChannelUseCase =
  createInjectionToken<StopLiveChannelUseCase>('StopLiveChannelUseCase', {
    useClass: StopLiveChannelUseCaseImpl,
  });
