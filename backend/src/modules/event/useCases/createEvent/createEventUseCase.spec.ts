import { CreateEventUseCase } from "./createEventUseCase";
import { FakeEventRepository } from "../../repositories/tests/fakeEventRepository";
import { eventRepository } from "../../repositories";
import { createEventUseCase } from "./index";
import { mockClient } from "aws-sdk-client-mock";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import '../../index';

let useCase: CreateEventUseCase = createEventUseCase;
let fakeEventRepo: FakeEventRepository = eventRepository;

const startTime = new Date(Date.now());
startTime.setDate(startTime.getDate() + 1);

const endTime = new Date(Date.now());
endTime.setDate(endTime.getDate() + 2);

const eventBridgeMock = mockClient(EventBridgeClient);

describe('CreateEventUseCase', () => {

  eventBridgeMock.on(PutEventsCommand).resolves({});

  beforeEach(() =>  {
    eventBridgeMock.reset();
  });

  it('Should create an event', async () => {
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
  });

  it('Should return a failed result if an error is thrown', async () => {
    jest
      .spyOn(fakeEventRepo, 'save')
      .mockImplementation(() => {
        throw new Error("An error occurred.")
      }
    );

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

    expect(event.isSuccess).toBe(false);
    expect(event.errorValue()).toBe("An error occurred.");
  });
})
