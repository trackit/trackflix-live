import { tokenCreateLiveChannelUseCase } from '@trackflix-live/api-events';
import { inject } from '@trackflix-live/di';
import { EventEndpoint } from '@trackflix-live/types';

export class CreateMediaLiveChannelAdapter {
  private readonly useCase = inject(tokenCreateLiveChannelUseCase);

  public async handle(params: {
    input: {
      eventId: string;
      mainChannelId: string;
      verticalChannelId: string;
      endpoints: EventEndpoint[];
    };
    taskToken: string;
  }): Promise<{
    eventId: string;
    mainChannelId: string;
    verticalChannelId: string;
    liveChannelId: string;
    liveChannelArn: string;
  }> {
    const liveChannel = await this.useCase.createLiveChannel({
      eventId: params.input.eventId,
      packageChannelId: params.input.mainChannelId,
      verticalPackageChannelId: params.input.verticalChannelId,
      packageDomainName: 'not-implemented-yet', // This will be updated by createCloudFrontOrigin later
      taskToken: params.taskToken,
      endpoints: params.input.endpoints,
    });

    return {
      eventId: params.input.eventId,
      mainChannelId: params.input.mainChannelId,
      verticalChannelId: params.input.verticalChannelId,
      liveChannelArn: liveChannel.channelArn,
      liveChannelId: liveChannel.channelId,
    };
  }
}
