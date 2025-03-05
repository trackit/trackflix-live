import {
  ConsumeTaskTokenParameters,
  ConsumeTaskTokenResponse,
  CreateTaskTokenParameters,
  TaskTokensRepository,
} from '../ports/TaskTokensRepository';
import { createInjectionToken } from '@trackflix-live/di';

export type Document = CreateTaskTokenParameters;

export class TaskTokensRepositoryInMemory implements TaskTokensRepository {
  public taskTokens: Document[] = [];

  public async createTaskToken(
    parameters: CreateTaskTokenParameters
  ): Promise<void> {
    this.taskTokens.push(parameters);
  }

  public async consumeTaskToken(
    parameters: ConsumeTaskTokenParameters
  ): Promise<ConsumeTaskTokenResponse | undefined> {
    const taskTokenIndex = this.taskTokens.findIndex(
      (token) =>
        token.channelArn === parameters.channelArn &&
        token.expectedStatus === parameters.expectedStatus
    );
    if (taskTokenIndex < 0) {
      return undefined;
    }

    const taskToken = this.taskTokens[taskTokenIndex];

    this.taskTokens = this.taskTokens.filter(
      (_, index) => index !== taskTokenIndex
    );

    return {
      taskToken: taskToken.taskToken,
      output: taskToken.output,
    };
  }
}

export const tokenTaskTokensRepositoryInMemory =
  createInjectionToken<TaskTokensRepositoryInMemory>(
    'TaskTokensRepositoryInMemory',
    {
      useClass: TaskTokensRepositoryInMemory,
    }
  );
