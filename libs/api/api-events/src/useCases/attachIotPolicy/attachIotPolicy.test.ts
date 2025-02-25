import { AttachIotPolicyUseCaseImpl } from './attachIotPolicy';
import { EventUpdateSenderFake } from '../../infrastructure';

describe('Attach Iot policy use case', () => {
  it('should attach policy', async () => {
    const { eventUpdateSender, useCase } = setup();
    const identityId = '9c99241d-8cfe-4af9-9894-a7a6961fadb3';

    await useCase.attachIotPolicy(identityId);

    expect(eventUpdateSender.attachedIdentities).toEqual([identityId]);
  });
});

const setup = () => {
  const eventUpdateSender = new EventUpdateSenderFake();

  const useCase = new AttachIotPolicyUseCaseImpl({
    eventUpdateSender,
  });

  return {
    eventUpdateSender,
    useCase,
  };
};
