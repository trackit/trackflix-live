import { CreateEventArgs } from './createEvent';
import { Source } from '@trackflix-live/types';

export class CreateEventMother {
  private readonly data: CreateEventArgs;

  private constructor(data: CreateEventArgs) {
    this.data = data;
  }

  public static basic() {
    return new CreateEventMother({
      name: 'My first event',
      description: 'This is a sample testing event',
      onAirStartTime: '2030-01-22T10:00:00.000Z',
      onAirEndTime: '2030-01-22T11:00:00.000Z',
      source: 's3://sample-bucket/sample-asset.mp4',
      userGroups: ['Creators'],
    });
  }

  public withName(name: string) {
    this.data.name = name;
    return this;
  }

  public withOnAirStartTime(onAirStartTime: string) {
    this.data.onAirStartTime = onAirStartTime;
    return this;
  }

  public withOnAirEndTime(onAirEndTime: string) {
    this.data.onAirEndTime = onAirEndTime;
    return this;
  }

  public withSource(source: Source) {
    this.data.source = source;
    return this;
  }

  public withUserGroups(userGroups: string[]) {
    this.data.userGroups = userGroups;
    return this;
  }

  public build() {
    return this.data;
  }
}
