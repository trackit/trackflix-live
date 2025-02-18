import {
  CreateChannelParameters,
  CreateChannelResponse,
  LiveChannelsManager,
} from '../ports/LiveChannelsManager';

export class LiveChannelsManagerFake implements LiveChannelsManager {
  private createChannelResponse: CreateChannelResponse = {
    channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488',
    channelId: '8626488',
  };

  public readonly createdChannels: CreateChannelParameters[] = [];

  public readonly startedChannels: string[] = [];

  public readonly stoppedChannels: string[] = [];

  public async createChannel(
    parameters: CreateChannelParameters
  ): Promise<CreateChannelResponse> {
    this.createdChannels.push(parameters);
    return this.createChannelResponse;
  }

  public async startChannel(channelId: string): Promise<void> {
    this.startedChannels.push(channelId);
  }

  public setCreateChannelResponse(
    createChannelResponse: CreateChannelResponse
  ) {
    this.createChannelResponse = createChannelResponse;
  }

  public async stopChannel(channelId: string): Promise<void> {
    this.stoppedChannels.push(channelId);
  }
}
