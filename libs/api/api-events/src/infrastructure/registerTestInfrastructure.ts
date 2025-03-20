import { inject, register } from '@trackflix-live/di';
import {
  tokenEventSchedulerDeleteFake,
  tokenEventSchedulerStartFake,
  tokenEventSchedulerStopFake,
  tokenEventsRepositoryInMemory,
  tokenEventUpdateSenderFake,
  tokenLiveChannelsManagerFake,
  tokenPackageChannelsManagerFake,
  tokenTaskTokensRepositoryInMemory,
  tokenTransmissionsManagerFake,
  tokenCDNDistributionsManagerFake,
} from '.';
import {
  tokenAssetsService,
  tokenCDNDistributionsManager,
  tokenEventSchedulerDelete,
  tokenEventSchedulerStart,
  tokenEventSchedulerStop,
  tokenEventsRepository,
  tokenEventUpdateSender,
  tokenLiveChannelsManager,
  tokenPackageChannelsManager,
  tokenTaskTokensRepository,
  tokenTransmissionsManager,
} from '../ports';
import { tokenAssetsServiceFake } from './AssetsServiceFake';

export const registerTestInfrastructure = () => {
  register(tokenEventSchedulerStart, {
    useFactory: () => inject(tokenEventSchedulerStartFake),
  });
  register(tokenEventSchedulerStop, {
    useFactory: () => inject(tokenEventSchedulerStopFake),
  });
  register(tokenEventSchedulerDelete, {
    useFactory: () => inject(tokenEventSchedulerDeleteFake),
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
  register(tokenAssetsService, {
    useFactory: () => inject(tokenAssetsServiceFake),
  });
  register(tokenCDNDistributionsManager, {
    useFactory: () => inject(tokenCDNDistributionsManagerFake),
  });
};
