import { AssetNotFoundError, CreateEventUseCaseImpl } from './createEvent';
import {
  registerTestInfrastructure,
  tokenEventSchedulerStartFake,
  tokenEventSchedulerStopFake,
  tokenEventsRepositoryInMemory,
} from '../../infrastructure';
import { CreateEventMother } from './CreateEventMother';
import { tokenEventUpdateSenderFake } from '../../infrastructure';
import { EventStatus, EventUpdateAction } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';
import { tokenAssetsServiceFake } from '../../infrastructure/AssetsServiceFake';
import { AuthorizationError } from '../../utils';
import * as allure from 'allure-js-commons';

describe('CreateEvent use case', () => {
  it('should save event', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventsRepository, assetsService, useCase } = setup();
    const source = 's3://videos/hello.mp4';
    assetsService.addAsset(source);

    await useCase.createEvent(
      CreateEventMother.basic()
        .withName('Test event')
        .withSource(source)
        .withUserGroups(['Creators'])
        .build()
    );

    expect(eventsRepository.events).toMatchObject([
      {
        name: 'Test event',
        createdTime: expect.any(String),
        logs: [],
        endpoints: [],
        status: EventStatus.PRE_TX,
      },
    ]);
  });

  it('should send a live update', async () => {
    await allure.epic('MVP');
    await allure.feature('Live updates');
    await allure.story(
      'As a user, I want my user interface to update without refreshing the page'
    );
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, eventUpdateSender, assetsService } = setup();
    const source = 's3://videos/hello.mp4';
    assetsService.addAsset(source);

    const event = await useCase.createEvent(
      CreateEventMother.basic()
        .withName('Test event')
        .withSource(source)
        .withUserGroups(['Creators'])
        .build()
    );

    expect(eventUpdateSender.eventUpdates).toHaveLength(1);
    expect(eventUpdateSender.eventUpdates[0]).toEqual({
      action: EventUpdateAction.EVENT_UPDATE_CREATE,
      value: event,
    });
  });

  it('should schedule the creation of resources 5 minutes before air', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventSchedulerStart, useCase, assetsService } = setup();
    const source = 's3://videos/hello.mp4';
    assetsService.addAsset(source);

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirStartTime('2025-01-22T09:45:07.202Z')
        .withSource(source)
        .withUserGroups(['Creators'])
        .build()
    );

    expect(eventSchedulerStart.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T09:40:07.202Z'),
      },
    ]);
  });

  it('should schedule the destruction of resources after air', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { eventSchedulerStop, useCase, assetsService } = setup();
    const source = 's3://videos/hello.mp4';
    assetsService.addAsset(source);

    await useCase.createEvent(
      CreateEventMother.basic()
        .withOnAirEndTime('2025-01-22T09:45:07.202Z')
        .withSource(source)
        .withUserGroups(['Creators'])
        .build()
    );

    expect(eventSchedulerStop.scheduledEvents).toMatchObject([
      {
        time: new Date('2025-01-22T09:45:07.202Z'),
      },
    ]);
  });

  it('should throw if asset does not exist', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase } = setup();

    await expect(
      useCase.createEvent(
        CreateEventMother.basic()
          .withSource('s3://unknown-bucket/my_video.mp4')
          .withUserGroups(['Creators'])
          .build()
      )
    ).rejects.toThrow(AssetNotFoundError);
  });

  it('should throw if user is not in Creators group', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Roles');
    await allure.owner('Alexandre Sauner');
    await allure.severity('normal');

    const { useCase, assetsService } = setup();
    const source = 's3://videos/hello.mp4';
    assetsService.addAsset(source);

    await expect(
      useCase.createEvent(
        CreateEventMother.basic()
          .withSource(source)
          .withUserGroups(['Viewers'])
          .build()
      )
    ).rejects.toThrow(AuthorizationError);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventSchedulerStart = inject(tokenEventSchedulerStartFake);
  const eventSchedulerStop = inject(tokenEventSchedulerStopFake);
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);
  const assetsService = inject(tokenAssetsServiceFake);

  const useCase = new CreateEventUseCaseImpl();

  return {
    eventSchedulerStart,
    eventSchedulerStop,
    eventsRepository,
    eventUpdateSender,
    useCase,
    assetsService,
  };
};
