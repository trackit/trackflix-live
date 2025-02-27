import { inject, register } from '@trackflix-live/di';
import {
  tokenEventSchedulerStartFake,
  tokenEventSchedulerStopFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenPackageChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
  tokenTransmissionsManagerFake,
} from '.';
import {
  tokenEventSchedulerStart,
  tokenEventSchedulerStop,
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenPackageChannelsManager,
  tokenTaskTokensRepository,
  tokenTransmissionsManager,
} from '../ports';

export const registerTestInfrastructure = () => {
  register(tokenEventSchedulerStart, {
    useFactory: () => inject(tokenEventSchedulerStartFake),
  });
  register(tokenEventSchedulerStop, {
    useFactory: () => inject(tokenEventSchedulerStopFake),
  });
  register(tokenEventsRepository, {
    useFactory: () => inject(tokenEventsRepositoryInMemory),
  });
  register(tokenEventUpdateSender, {
    useFactory: () => inject(tokenEventUpdateSenderFake),
  });
  register(tokenLiveChannelsManager, {
    useFactory: () => inject(tokenLiveChannelsManagerFake),
  });
  register(tokenPackageChannelsManager, {
    useFactory: () => inject(tokenPackageChannelsManagerFake),
  });
  register(tokenTaskTokensRepository, {
    useFactory: () => inject(tokenTaskTokensRepositoryInMemory),
  });
  register(tokenTransmissionsManager, {
    useFactory: () => inject(tokenTransmissionsManagerFake),
  });
};
