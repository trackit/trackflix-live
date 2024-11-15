import { CreateEventUseCase } from "./createEventUseCase";
import { FakeEventRepository } from "../../repositories/tests/fakeEventRepository";
import '../../index';

let useCase: CreateEventUseCase;
let fakeEventRepo: FakeEventRepository = new FakeEventRepository();

describe('CreateEventUseCase', () => {
  beforeEach(() => {
    useCase = new CreateEventUseCase(
      fakeEventRepo,
    );
  })

  it('should create an event', async () => {
    const startTime = new Date(Date.now());
    startTime.setDate(startTime.getDate() + 1);

    const endTime = new Date(Date.now());
    endTime.setDate(endTime.getDate() + 2);

    const event = await useCase.execute({
      name: 'Event',
      description: 'Description',
      onAirStartTime: startTime,
      onAirEndTime: endTime,
      status: 'TX',
      source: {
        name: 'name',
        protocol: 'HLS',
      },
    });

    expect(event.isSuccess).toBe(true);
    expect(event.getValue()).not.toBeNull();
  })
})
