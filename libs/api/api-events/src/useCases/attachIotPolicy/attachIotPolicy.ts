import { tokenEventUpdateSender } from '../../ports';
import { inject } from 'di';

export interface AttachIotPolicyUseCase {
  attachIotPolicy(identityId: string): Promise<void>;
}

export class AttachIotPolicyUseCaseImpl implements AttachIotPolicyUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async attachIotPolicy(identityId: string): Promise<void> {
    await this.eventUpdateSender.attachPolicyToIdentity(identityId);
  }
}
