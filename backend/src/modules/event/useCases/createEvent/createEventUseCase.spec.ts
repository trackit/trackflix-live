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
    const event = await useCase.execute({
      name: 'Event',
      description: 'Description',
      onAirStartTime: new Date(),
      onAirEndTime: new Date(),
      status: 'status',
      source: {
        name: 'name',
        protocol: 'protocol',
      }
    });

    expect(event.isSuccess).toBe(true);
    expect(event.getValue()).not.toBeNull();
  })
})
