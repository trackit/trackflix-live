import {
  CreateChannelParameters,
  CreateChannelResponse,
  LiveChannelsManager,
} from '../ports/LiveChannelsManager';

export class LiveChannelsManagerFake implements LiveChannelsManager {
  private createChannelResponse: CreateChannelResponse = {
    channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488',
    channelId: '8626488',
    inputId: '1234567',
  };

  public readonly createdChannels: CreateChannelParameters[] = [];

  public readonly startedChannels: string[] = [];

  public readonly stoppedChannels: string[] = [];

  public readonly deletedChannels: string[] = [];

  public readonly deletedInputs: string[] = [];

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

  public async deleteChannel(channelId: string): Promise<void> {
    this.deletedChannels.push(channelId);
  }

  public async deleteInput(inputId: string): Promise<void> {
    this.deletedInputs.push(inputId);
  }
}
