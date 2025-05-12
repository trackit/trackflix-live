import { Event, EventEndpoint, EventStatus, Source } from '../lib/types';
import { InputType } from '@aws-sdk/client-medialive';

export class EventMother {
  private readonly data: Event;

  private constructor(data: Event) {
    this.data = data;
  }

  public withId(id: string): EventMother {
    this.data.id = id;
    return this;
  }

  public withSource(source: Source): EventMother {
    this.data.source = source;
    return this;
  }

  public withStatus(status: EventStatus): EventMother {
    this.data.status = status;
    return this;
  }

  public withEndpoints(endpoints: EventEndpoint[]): EventMother {
    this.data.endpoints = endpoints;
    return this;
  }

  public withLiveChannelArn(liveChannelArn: string | undefined): EventMother {
    this.data.liveChannelArn = liveChannelArn;
    return this;
  }

  public withLiveChannelId(liveChannelId: string | undefined): EventMother {
    this.data.liveChannelId = liveChannelId;
    return this;
  }

  public withLiveInputId(liveInputId: string | undefined): EventMother {
    this.data.liveInputId = liveInputId;
    return this;
  }

  public withPackageDomainName(
    packageDomainName: string | undefined
  ): EventMother {
    this.data.packageDomainName = packageDomainName;
    return this;
  }

  public withLiveWaitingInputId(
    liveWaitingInputId: string | undefined
  ): EventMother {
    this.data.liveWaitingInputId = liveWaitingInputId;
    return this;
  }

  public withName(name: string): EventMother {
    this.data.name = name;
    return this;
  }

  public withOnAirStartTime(onAirStartTime: string): EventMother {
    this.data.onAirStartTime = onAirStartTime;
    return this;
  }

  public withOnAirEndTime(onAirEndTime: string): EventMother {
    this.data.onAirEndTime = onAirEndTime;
    return this;
  }

  public static basic() {
    return new EventMother({
      id: '5e9019f4-b937-465c-ab7c-baeb74eb26a2',
      name: 'Formula 1 Monaco Grand Prix',
      description:
        'Live broadcast of the Formula 1 Monaco Grand Prix, featuring the top drivers battling on the iconic street circuit.',
      onAirStartTime: '2025-01-22T10:00:00.000Z',
      onAirEndTime: '2025-01-22T20:00:00.000Z',
      createdTime: '2025-01-20T09:00:00.000Z',
      source: {
        value: 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4',
        inputType: InputType.MP4_FILE,
      },
      status: EventStatus.PRE_TX,
      endpoints: [],
      logs: [],
    });
  }

  public build() {
    return this.data;
  }
}
