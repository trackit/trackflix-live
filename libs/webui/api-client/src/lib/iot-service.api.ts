import { ApiBaseClient } from './api-base-client';
import { IotService } from './iot-service';
import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';

export class IotServiceApi extends ApiBaseClient implements IotService {
  public async attachIotPolicy(
    id: AttachIotPolicyRequest['body']
  ): Promise<AttachIotPolicyResponse['body']> {
    return this.post<AttachIotPolicyResponse['body']>('/iot', {
      identityId: id.identityId,
    });
  }
}
