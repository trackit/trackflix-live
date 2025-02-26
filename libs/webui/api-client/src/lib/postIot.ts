import { apiClient } from './client';
import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';

export const postIot = async (id: AttachIotPolicyRequest['body']) => {
  return apiClient.post<AttachIotPolicyResponse['body']>('/iot', {
    identityId: id.identityId,
  });
};
