import {
  CreateChannelParameters,
  CreateChannelResponse,
  LiveChannelsManager,
  StartChannelParameters,
} from '../ports/LiveChannelsManager';
import { createInjectionToken } from '@trackflix-live/di';

export class LiveChannelsManagerFake implements LiveChannelsManager {
  private createChannelResponse: CreateChannelResponse = {
    channelArn: 'arn:aws:medialive:us-west-2:000000000000:channel:8626488',
    channelId: '8626488',
    inputId: '1234567',
    waitingInputId: '7654321',
  };

  public readonly createdChannels: CreateChannelParameters[] = [];

  public readonly startedChannels: StartChannelParameters[] = [];

  public readonly stoppedChannels: string[] = [];

  public readonly deletedChannels: string[] = [];

  public readonly deletedInputs: string[] = [];

  public async createChannel(
    parameters: CreateChannelParameters
  ): Promise<CreateChannelResponse> {
    this.createdChannels.push(parameters);
    return this.createChannelResponse;
  }

  public async startChannel(parameters: StartChannelParameters): Promise<void> {
    this.startedChannels.push(parameters);
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

export const tokenLiveChannelsManagerFake =
  createInjectionToken<LiveChannelsManagerFake>('LiveChannelsManagerFake', {
    useClass: LiveChannelsManagerFake,
  });
