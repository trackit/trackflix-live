import { EventUpdateSender } from '../../ports';

export interface AttachIotPolicyUseCase {
  attachIotPolicy(identityId: string): Promise<void>;
}

export class AttachIotPolicyUseCaseImpl implements AttachIotPolicyUseCase {
  private readonly eventUpdateSender: EventUpdateSender;

  public constructor({
    eventUpdateSender,
  }: {
    eventUpdateSender: EventUpdateSender;
  }) {
    this.eventUpdateSender = eventUpdateSender;
  }

  public async attachIotPolicy(identityId: string): Promise<void> {
    await this.eventUpdateSender.attachPolicyToIdentity(identityId);
  }
}
