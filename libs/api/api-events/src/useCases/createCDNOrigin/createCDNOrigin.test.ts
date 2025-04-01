import { CreateCDNOriginUseCaseImpl } from './createCDNOrigin';
import {
  registerTestInfrastructure,
  tokenCDNDistributionsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother, EventUpdateAction, EventEndpoint, EndpointType } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { EventDoesNotExistError } from '../../utils/errors';

describe('Create CDN origin use case', () => {
  it('should create CDN origin', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const liveChannelArn = 'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await eventsRepository.createEvent(
      EventMother.basic()
        .withId(eventId)
        .withPackageDomainName(packageDomainName)
        .withPackageDomainName('trackit.io')
        .withEndpoints(endpoints)
        .build()
    );

    await useCase.createCDNOrigin({
      eventId,
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      packageDomainName,
      endpoints
    });

    expect(CDNDistributionsManager.createdOrigins).toEqual([
      {
        eventId,
        packageDomainName,
      },
    ]);
  });

  it('should store logs after creating the CDN origin', async () => {
    const { useCase, eventsRepository } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const liveChannelArn = 'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';
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
      liveChannelArn,
      liveChannelId,
      packageChannelId,
      packageDomainName,
      endpoints
    });

    expect(eventsRepository.events[0].logs).toEqual([
      {
        timestamp: expect.any(Number),
        type: 'CDN_ORIGIN_CREATED',
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
    const liveChannelArn = 'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';
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
      liveChannelArn,
      liveChannelId,
      packageChannelId,
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
              type: 'CDN_ORIGIN_CREATED',
            },
          ],
        },
      },
    ]);
  });

  it('should throw if event does not exist', async () => {
    const { useCase } = setup();
    const eventId = 'b5654288-ac69-4cef-90da-32d8acb67a89';
    const liveChannelArn = 'arn:aws:medialive:us-east-1:123456789012:channel:1234';
    const liveChannelId = '1234';
    const packageChannelId = 'abcd';
    const packageDomainName = 'trackit.io';
    const endpoints: EventEndpoint[] = [
      { url: 'https://example.com/hls', type: EndpointType.HLS },
      { url: 'https://example.com/dash', type: EndpointType.DASH }
    ];

    await expect(
      useCase.createCDNOrigin({
        eventId,
        liveChannelArn,
        liveChannelId,
        packageChannelId,
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
  const CDNDistributionsManager = inject(tokenCDNDistributionsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateCDNOriginUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    CDNDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
