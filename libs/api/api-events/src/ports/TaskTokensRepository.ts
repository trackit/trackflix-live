export interface CreateTaskTokenParameters {
  channelArn: string;
  expectedStatus: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
  taskToken: string;
  output: unknown;
}

export interface ConsumeTaskTokenParameters {
  channelArn: string;
  expectedStatus: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
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
