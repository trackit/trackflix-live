import { CreatePackageChannelUseCaseImpl } from './createPackageChannel';
import { PackageChannelsManagerFake } from '../../infrastructure/PackageChannelsManagerFake';
import { EventsRepositoryInMemory } from '../../infrastructure/EventsRepositoryInMemory';
import { EventUpdateSenderFake } from '../../infrastructure/EventUpdateSenderFake';
import { EventMother, EventUpdateAction, LogType } from '@trackflix-live/types';

describe('Create Package channel use case', () => {
  it('should create channel', async () => {
    const {
      useCase,
      packageChannelsManager,
      eventsRepository,
      eventUpdateSender,
    } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);

    const response = await useCase.createPackageChannel(event.id);

    expect(response).toEqual(packageChannelId);
    expect(packageChannelsManager.createdChannels).toEqual([event.id]);
    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.PACKAGE_CHANNEL_CREATED,
      },
    ]);
    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: eventsRepository.events[0],
      },
    ]);
  });
});

const setup = () => {
  const packageChannelsManager = new PackageChannelsManagerFake();
  const eventsRepository = new EventsRepositoryInMemory();
  const eventUpdateSender = new EventUpdateSenderFake();
  const useCase = new CreatePackageChannelUseCaseImpl({
    packageChannelsManager,
    eventsRepository,
    eventUpdateSender,
  });

  return {
    useCase,
    packageChannelsManager,
    eventsRepository,
    eventUpdateSender,
  };
};
