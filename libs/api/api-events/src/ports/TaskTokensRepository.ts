import { createInjectionToken } from '@trackflix-live/di';
import { PackageChannelsManager } from './PackageChannelsManager';

export interface CreateTaskTokenParameters {
  channelArn: string;
  expectedStatus: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'DELETED';
  taskToken: string;
  output: unknown;
}

export interface ConsumeTaskTokenParameters {
  channelArn: string;
  expectedStatus: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'DELETED';
}

export interface ConsumeTaskTokenResponse {
  taskToken: string;
  output: unknown;
}

export interface TaskTokensRepository {
  createTaskToken(parameters: CreateTaskTokenParameters): Promise<void>;
  consumeTaskToken(
    parameters: ConsumeTaskTokenParameters
  ): Promise<ConsumeTaskTokenResponse | undefined>;
}

export const tokenTaskTokensRepository =
  createInjectionToken<TaskTokensRepository>('TaskTokensRepository');
