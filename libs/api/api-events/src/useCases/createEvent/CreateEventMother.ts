import { CreateEventArgs } from './createEvent';

export class CreateEventMother {
  private readonly data: CreateEventArgs;

  private constructor(data: CreateEventArgs) {
    this.data = data;
  }

  public static basic() {
    return new CreateEventMother({
      name: 'My first event',
      description: 'This is a sample testing event',
      onAirStartTime: new Date('2025-01-22T10:00:00.000Z'),
      onAirEndTime: new Date('2025-01-22T11:00:00.000Z'),
      source: {
        bucket: 'sample-bucket',
        key: 'sample-asset.mp4',
      },
    });
  }

  public withName(name: string) {
    this.data.name = name;
    return this;
  }

  public withOnAirStartTime(onAirStartTime: Date) {
    this.data.onAirStartTime = onAirStartTime;
    return this;
  }

  public build() {
    return this.data;
  }
}
