import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';

export interface IotService {
  attachIotPolicy(
    id: AttachIotPolicyRequest['body']
  ): Promise<AttachIotPolicyResponse['body']>;
}
