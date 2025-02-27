import { AttachIotPolicyUseCaseImpl } from './attachIotPolicy';
import {
  tokenEventUpdateSenderFake,
  registerTestInfrastructure,
} from '../../infrastructure';
import { inject, reset } from '@trackflix-live/di';

describe('Attach Iot policy use case', () => {
  it('should attach policy', async () => {
    const { eventUpdateSender, useCase } = setup();
    const identityId = '9c99241d-8cfe-4af9-9894-a7a6961fadb3';

    await useCase.attachIotPolicy(identityId);

    expect(eventUpdateSender.attachedIdentities).toEqual([identityId]);
  });
});

const setup = () => {
  reset();
  registerTestInfrastructure();
  const eventUpdateSender = inject(tokenEventUpdateSenderFake);

  const useCase = new AttachIotPolicyUseCaseImpl();

  return {
    eventUpdateSender,
    useCase,
  };
};
