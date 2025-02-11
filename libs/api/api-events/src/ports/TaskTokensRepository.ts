export interface CreateTaskTokenParameters {
  channelArn: string;
  expectedStatus: 'CREATED' | 'RUNNING' | 'STOPPING' | 'STOPPED';
  taskToken: string;
  output: unknown;
}

export interface TaskTokensRepository {
  createTaskToken(parameters: CreateTaskTokenParameters): Promise<void>;
}
