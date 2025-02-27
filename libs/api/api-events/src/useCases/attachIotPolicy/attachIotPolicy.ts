import { tokenEventUpdateSender } from '../../ports';
import { createInjectionToken, inject } from 'di';

export interface AttachIotPolicyUseCase {
  attachIotPolicy(identityId: string): Promise<void>;
}

export class AttachIotPolicyUseCaseImpl implements AttachIotPolicyUseCase {
  private readonly eventUpdateSender = inject(tokenEventUpdateSender);

  public async attachIotPolicy(identityId: string): Promise<void> {
    await this.eventUpdateSender.attachPolicyToIdentity(identityId);
  }
}

export const tokenAttachIotPolicyUseCase =
  createInjectionToken<AttachIotPolicyUseCase>('AttachIotPolicyUseCase', {
    useClass: AttachIotPolicyUseCaseImpl,
  });
