import { Event, EventStatus } from '../lib/types';

export class EventMother {
  private readonly data: Event;

  private constructor(data: Event) {
    this.data = data;
  }

  public withId(id: string): EventMother {
    this.data.id = id;
    return this;
  }

  public static basic() {
    return new EventMother({
      id: '5e9019f4-b937-465c-ab7c-baeb74eb26a2',
      name: 'Formula 1 Monaco Grand Prix',
      description:
        'Live broadcast of the Formula 1 Monaco Grand Prix, featuring the top drivers battling on the iconic street circuit.',
      onAirStartTime: new Date('2025-01-22T10:00:00.000Z'),
      onAirEndTime: new Date('2025-01-22T20:00:00.000Z'),
      source: {
        bucket: 'f1-live-broadcasts',
        key: 'monaco-gp-2025-live.mp4',
      },
      status: EventStatus.PRE_TX,
    });
  }

  public build() {
    return this.data;
  }
}
