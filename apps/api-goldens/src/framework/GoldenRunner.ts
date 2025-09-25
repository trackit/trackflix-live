import {
  Scenario,
  ScenarioStepBase,
  ScenarioStepRequest,
  ScenarioStepType,
  ScenarioStepVerifyResources,
  ScenarioStepWaitForRequest,
} from './Scenario';
import { sleep } from './utils';
import { GoldenUsersManager } from './GoldenUsersManager';
import { GoldenDatabasesManager } from './GoldenDatabasesManager';
import { GoldenLogsManager } from './GoldenLogsManager';
import { GoldenRequestsManager } from './GoldenRequestsManager';

const SECONDS_TO_MILLISECONDS = 1000;

const MINUTES_TO_SECONDS = 60;

export class GoldenRunner {
  private readonly scenario: Scenario;

  private readonly usersManager: GoldenUsersManager;

  private readonly databasesManager: GoldenDatabasesManager;

  private readonly logsManager: GoldenLogsManager;

  private readonly requestsManager: GoldenRequestsManager;

  public constructor(scenario: Scenario) {
    this.scenario = scenario;

    const { API_URL, LOGS_BUCKET, EVENTS_TABLE_NAME, USERPOOL_ID, CLIENT_ID } =
      process.env;

    if (
      [API_URL, LOGS_BUCKET, EVENTS_TABLE_NAME, USERPOOL_ID, CLIENT_ID].some(
        (envVar) => envVar === undefined
      )
    ) {
      throw new Error('Missing environment variables.');
    }

    this.usersManager = new GoldenUsersManager({
      userpoolId: USERPOOL_ID,
      clientId: CLIENT_ID,
    });

    this.databasesManager = new GoldenDatabasesManager({
      eventsTableName: EVENTS_TABLE_NAME,
    });

    this.logsManager = new GoldenLogsManager({
      logsBucket: LOGS_BUCKET,
    });

    this.requestsManager = new GoldenRequestsManager({
      apiUrl: API_URL,
    });
  }

  public run() {
    beforeAll(async () => {
      await this.usersManager.setupUsers(this.scenario);
    });

    afterAll(async () => {
      await this.usersManager.destroyUsers(this.scenario);
      await this.databasesManager.wipeDatabase();
    });

    for (const step of this.scenario.steps) {
      it(
        step.name,
        async () => {
          switch (step.type) {
            case ScenarioStepType.REQUEST:
              await this.request(step);
              break;
            case ScenarioStepType.WAIT_FOR_REQUEST:
              await this.waitForRequest(step);
              break;
            case ScenarioStepType.VERIFY_RESOURCES:
              await this.verifyResources(step);
              break;
          }
        },
        10 * MINUTES_TO_SECONDS * SECONDS_TO_MILLISECONDS
      );
    }
  }

  private async request(step: ScenarioStepRequest & ScenarioStepBase) {
    const response = await this.requestsManager.request({
      ...step,
      token: this.usersManager.getUserToken(step.user),
    });

    expect(response.status).toEqual(
      step.expectedStatusCode !== undefined ? step.expectedStatusCode : 200
    );

    if (typeof step.expectedResponse === 'string') {
      expect(response.body).toEqual(step.expectedResponse);
    } else if (step.expectedResponse !== undefined) {
      expect(JSON.parse(response.body)).toMatchObject(step.expectedResponse);
    }
  }

  private async waitForRequest(
    step: ScenarioStepWaitForRequest & ScenarioStepBase
  ) {
    let success = false;
    for (let i = 0; i < step.maximumRetries; i += 1) {
      const response = await this.requestsManager.request({
        ...step,
        token: this.usersManager.getUserToken(step.user),
      });

      try {
        expect(response.status).toEqual(
          step.expectedStatusCode !== undefined ? step.expectedStatusCode : 200
        );
        expect(JSON.parse(response.body)).toMatchObject(step.expectedResponse);
        success = true;
        break;
      } catch {
        await sleep(step.secondsBetweenRetries * SECONDS_TO_MILLISECONDS);
      }
    }

    if (!success) {
      throw new Error(`Wait for request "${step.name}" failed.`);
    }
  }

  private async verifyResources(
    step: ScenarioStepVerifyResources & ScenarioStepBase
  ) {
    const logs = await this.logsManager.fetchLogs({
      eventId: this.requestsManager.processCacheQuery(step.eventId),
      before: step.before,
      after: step.after,
    });

    expect(logs).toMatchObject(step.expectedCalls);
  }
}
