export interface Scenario {
  users: ScenarioUser[];
  steps: ScenarioStep[];
}

export type ScenarioStep = ScenarioStepBase & ScenarioStepRequest;

export enum ScenarioStepType {
  REQUEST,
}

export interface ScenarioStepBase {
  name: string;
}

export type ScenarioStepRequest = {
  type: ScenarioStepType.REQUEST;

  user: string;
  route: string;
  method?: string;
  body?: object;

  expectedStatusCode?: number;
  expectedResponse?: unknown;
};

export interface ScenarioUser {
  username: string;
  isCreator?: boolean;
}
