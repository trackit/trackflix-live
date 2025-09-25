export interface Scenario {
  users: ScenarioUser[];
  steps: ScenarioStep[];
}

export type ScenarioStep = ScenarioStepBase &
  (
    | ScenarioStepRequest
    | ScenarioStepWaitForRequest
    | ScenarioStepVerifyResources
    | ScenarioStepTodo
  );

export enum ScenarioStepType {
  REQUEST,
  WAIT_FOR_REQUEST,
  VERIFY_RESOURCES,
  TODO,
}

export interface ScenarioStepBase {
  name: string;
}

export interface ScenarioStepRequest {
  type: ScenarioStepType.REQUEST;

  user: string;
  route: string | ((cache: Record<string, string>) => string);
  method?: string;
  body?: object;

  expectedStatusCode?: number;
  expectedResponse?: unknown;
}

export interface ScenarioUser {
  username: string;
  isCreator?: boolean;
}

export type ScenarioStepWaitForRequest = Omit<ScenarioStepRequest, 'type'> & {
  type: ScenarioStepType.WAIT_FOR_REQUEST;

  secondsBetweenRetries: number;
  maximumRetries: number;
};

export interface ScenarioStepTodo {
  type: ScenarioStepType.TODO;
}

export interface ScenarioStepVerifyResources {
  type: ScenarioStepType.VERIFY_RESOURCES;

  eventId: (cache: Record<string, string>) => string;
  before?: Date;
  after?: Date;

  expectedCalls: unknown[];
}
