import { CreateCDNDistributionUseCaseImpl } from './createCDNDistribution';
import {
  registerTestInfrastructure,
  tokenCDNDistributionsManagerFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenTaskTokensRepositoryInMemory,
} from '../../infrastructure';
import { EventMother } from '@trackflix-live/types';
import { inject, reset } from '@trackflix-live/di';

describe('Create CDN distribution use case', () => {
  it('should create CDN distribution', async () => {
    const { useCase, CDNDistributionsManager } = setup();
    const cdnDistributionId = 'E2QWRUHAPVYC32'; 

    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    const response = await useCase.createCDNDistribution();

    expect(response).toEqual({
      cdnDistributionId
    });
    expect(CDNDistributionsManager.createdDistributions).toEqual([
      cdnDistributionId,
    ]);
  });

  it('should store distribution id after creating the CDN distribution', async () => {
    const { useCase, eventsRepository, CDNDistributionsManager } = setup();
    const cdnDistributionId = 'E2QWRUHAPVYC32';

    await eventsRepository.createEvent(
      EventMother.basic()
        .build()
    );
    CDNDistributionsManager.setCreateDistributionResponse({
      cdnDistributionId
    });

    await useCase.createCDNDistribution();

    expect(eventsRepository.events).toMatchObject([
      {
        createdTime: '2025-01-20T09:00:00.000Z',
        description: 'Live broadcast of the Formula 1 Monaco Grand Prix, featuring the top drivers battling on the iconic street circuit.',
        endpoints: [],
        id: '5e9019f4-b937-465c-ab7c-baeb74eb26a2',
        logs: [],
        name: 'Formula 1 Monaco Grand Prix',
        onAirEndTime: '2025-01-22T20:00:00.000Z',
        onAirStartTime: '2025-01-22T10:00:00.000Z',
        source: 's3://f1-live-broadcasts/monaco-gp-2025-live.mp4',
        status: 'PRE-TX',
      },
    ]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventsRepository = inject(tokenEventsRepositoryInMemory);
  const taskTokensRepository = inject(tokenTaskTokensRepositoryInMemory);
  const CDNDistributionsManager = inject(tokenCDNDistributionsManagerFake);
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new CreateCDNDistributionUseCaseImpl();

  return {
    eventsRepository,
    taskTokensRepository,
    CDNDistributionsManager,
    useCase,
    eventUpdateSender,
  };
};
