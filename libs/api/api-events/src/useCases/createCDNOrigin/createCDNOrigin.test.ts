import { CreateCDNOriginUseCaseImpl } from './createCDNOrigin';
import {
  registerTestInfrastructure,
  tokenCDNDistributionsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction, EventEndpoint, EndpointType, LogType } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';

describe('Create CDN origin use case', () => {
  it('should create CDN origin', async () => {
    const { useCase, eventsRepository, cdnDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .withEndpoints(endpoints)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      packageDomainName,
      endpoints
    });

    expect(cdnDistributionsManager.createdOrigins).toEqual([
      {
        eventId,
        packageDomainName
      },
    ]);
  });

  it('should update endpoints after creating the CDN origin', async () => {
    const { useCase, eventsRepository } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'trackit.io';
    const originalEndpoints: EventEndpoint[] = [
      { url: 'https://example.amazonaws.com/hls/index.m3u8', type: EndpointType.HLS },
      { url: 'https://example.amazonaws.com/dash/index.mpd', type: EndpointType.DASH }
    ];

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .withEndpoints(originalEndpoints)
        .build()
    );

    const result = await useCase.createCDNOrigin({
      eventId,
      packageDomainName,
      endpoints: originalEndpoints
    });

    const updatedEvent = await eventsRepository.getEvent(eventId);
    expect(updatedEvent?.endpoints).toEqual([
      { url: 'https://fake-distribution.cloudfront.net/hls/index.m3u8', type: EndpointType.HLS },
      { url: 'https://fake-distribution.cloudfront.net/dash/index.mpd', type: EndpointType.DASH }
    ]);

    expect(result.endpoints).toEqual([
      { url: 'https://fake-distribution.cloudfront.net/hls/index.m3u8', type: EndpointType.HLS },
      { url: 'https://fake-distribution.cloudfront.net/dash/index.mpd', type: EndpointType.DASH }
    ]);
  });

  it('should store logs after creating the CDN origin', async () => {
    const { useCase, eventsRepository } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      packageDomainName,
      endpoints
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: LogType.CDN_ORIGIN_CREATED,
      },
    ]);
  });

  it('should emit logs after creating the CDN origin', async () => {
    const {
      useCase,
      eventsRepository,
      eventUpdateSender,
    } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      packageDomainName,
      endpoints
    });

    expect(eventUpdateSender.eventUpdates).toMatchObject([
      {
        action: EventUpdateAction.EVENT_UPDATE_UPDATE,
        value: {
          id: eventId,
          logs: [
            {
              timestamp: expect.any(Number),
              type: LogType.CDN_ORIGIN_CREATED,
            },
          ],
        },
      },
    ]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await expect(
      useCase.createCDNOrigin({
        eventId,
        packageDomainName,
        endpoints
      })
    ).rejects.toThrow(EventDoesNotExistError);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const cdnDistributionsManager = inject(tokenCDNDistributionsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateCDNOriginUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    cdnDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
