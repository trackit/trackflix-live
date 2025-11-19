import { IotService } from './iot-service';
import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';

export class IotServiceFake implements IotService {
  public readonly attachedIdentityIds: string[] = [];

  public async attachIotPolicy(
    id: AttachIotPolicyRequest['body']
  ): Promise<AttachIotPolicyResponse['body']> {
    this.attachedIdentityIds.push(id.identityId);
    return {
      status: 'Ok',
    };
  }
}
