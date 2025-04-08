import { CreatePackageChannelUseCaseImpl } from './createPackageChannel';
import {
  tokenPackageChannelsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  registerTestInfrastructure,
} from '../../infrastructure';
import {
  EndpointType,
  EventMother,
  EventUpdateAction,
  LogType,
} from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Create Package channel use case', () => {
  it('should create channel', async () => {
    const { useCase, packageChannelsManager, eventsRepository } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().withEndpoints([]).build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);

    const response = await useCase.createPackageChannel(event.id);

    expect(response).toEqual(packageChannelId);
    expect(packageChannelsManager.createdChannels).toEqual([event.id]);
  });

  it('should store logs', async () => {
    const { useCase, packageChannelsManager, eventsRepository } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().withEndpoints([]).build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);

    await useCase.createPackageChannel(event.id);

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.PACKAGE_CHANNEL_CREATED,
      },
    ]);
  });

  it('should store endpoints', async () => {
    const { useCase, packageChannelsManager, eventsRepository } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().withEndpoints([]).build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);
    packageChannelsManager.setPackageChannelEndpoints([
      {
        url: `https://trackflix-live.mediapackage.com/${event.id}/index.m3u8`,
        type: EndpointType.HLS,
      },
      {
        url: `https://trackflix-live.mediapackage.com/${event.id}/index.mpd`,
        type: EndpointType.DASH,
      },
    ]);

    await useCase.createPackageChannel(event.id);

    expect(eventsRepository.events[0].endpoints).toEqual([
      {
        url: `https://trackflix-live.mediapackage.com/${event.id}/index.m3u8`,
        type: EndpointType.HLS,
      },
      {
        url: `https://trackflix-live.mediapackage.com/${event.id}/index.mpd`,
        type: EndpointType.DASH,
      },
    ]);
  });

  it('should update package domain name', async () => {
    const { useCase, packageChannelsManager, eventsRepository } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().withEndpoints([]).build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);
    packageChannelsManager.setPackageChannelEndpoints([
      {
        url: `https://trackflix-live.mediapackage.com/${event.id}/index.m3u8`,
        type: EndpointType.HLS,
      },
    ]);

    await useCase.createPackageChannel(event.id);

    expect(eventsRepository.events[0].packageDomainName).toEqual('trackflix-live.mediapackage.com');
  });

  it('should emit events', async () => {
    const {
      useCase,
      packageChannelsManager,
      eventsRepository,
      eventUpdateSender,
    } = setup();
    const packageChannelId = '8123456';

    const event = EventMother.basic().withEndpoints([]).build();
    await eventsRepository.createEvent(event);

    packageChannelsManager.setPackageChannelId(packageChannelId);

    await useCase.createPackageChannel(event.id);

    expect(eventUpdateSender.eventUpdates).toEqual([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: eventsRepository.events[0],
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const packageChannelsManager = inject(tokenPackageChannelsManagerFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreatePackageChannelUseCaseImpl();

  return {
    useCase,
    packageChannelsManager,
    eventsRepository,
    eventUpdateSender,
  };
};
