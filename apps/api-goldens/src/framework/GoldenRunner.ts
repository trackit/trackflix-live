import {
  Scenario,
  ScenarioStepRequest,
  ScenarioStepType,
  ScenarioUser,
} from './scenario';
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';

export class GoldenRunner {
  private readonly scenario: Scenario;

  private readonly cognito: CognitoIdentityProviderClient =
    new CognitoIdentityProviderClient();

  private readonly s3: S3Client = new S3Client();

  private readonly tokens: Record<string, string> = {};

  private readonly cache: Record<string, string> = {};

  public constructor(scenario: Scenario) {
    this.scenario = scenario;
  }

  public run() {
    beforeAll(async () => {
      await this.setupUsers();
    });

    afterAll(async () => {
      await this.destroyUsers();
    });

    for (const step of this.scenario.steps) {
      it(
        step.name,
        async () => {
          switch (step.type) {
            case ScenarioStepType.REQUEST: {
              const response = await this.request(step);

              expect(response.status).toEqual(
                step.expectedStatusCode !== undefined
                  ? step.expectedStatusCode
                  : 200
              );

              const body = await response.text();

              if (typeof step.expectedResponse === 'string') {
                expect(body).toEqual(step.expectedResponse);
              } else if (step.expectedResponse !== undefined) {
                expect(JSON.parse(body)).toMatchObject(step.expectedResponse);
              }

              this.cache[step.name] = body;

              break;
            }
            case ScenarioStepType.WAIT_FOR_REQUEST: {
              let success = false;
              for (let i = 0; i < step.maximumRetries; i += 1) {
                const response = await this.request(step);

                try {
                  const body = await response.json();
                  expect(body).toMatchObject(step.expectedResponse);
                  this.cache[step.name] = JSON.stringify(body);
                  success = true;
                  break;
                } catch {
                  await this.sleep(step.secondsBetweenRetries * 1000);
                }
              }

              if (!success) {
                throw new Error(`Wait for request "${step.name}" failed.`);
              }
              break;
            }
            case ScenarioStepType.VERIFY_RESOURCES: {
              const logs = await this.fetchQaLogs({
                eventId: step.eventId(this.cache),
                before: step.before,
                after: step.after,
              });

              expect(logs).toMatchObject(step.expectedCalls);
            }
          }
        },
        1000 * 60 * 10
      );
    }
  }

  private sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }

  private async setupUsers() {
    await Promise.all(
      this.scenario.users.map(async (user) => this.setupUser(user))
    );
  }

  private async setupUser(user: ScenarioUser) {
    await this.cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: process.env.USERPOOL_ID!,
        Username: user.username,
        TemporaryPassword: 'Qa@Trackit2025$',
      })
    );

    await this.cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: process.env.USERPOOL_ID!,
        Username: user.username,
        Password: 'Qa@Trackit2025$',
        Permanent: true,
      })
    );

    if (user.isCreator === true) {
      await this.cognito.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: process.env.USERPOOL_ID!,
          Username: user.username,
          GroupName: 'Creators',
        })
      );
    }

    const authResponse = await this.cognito.send(
      new AdminInitiateAuthCommand({
        UserPoolId: process.env.USERPOOL_ID!,
        ClientId: process.env.CLIENT_ID!,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: user.username,
          PASSWORD: 'Qa@Trackit2025$',
        },
      })
    );

    this.tokens[user.username] = authResponse.AuthenticationResult.IdToken;
  }

  private async destroyUsers() {
    await Promise.all(
      this.scenario.users.map(async (user) => this.destroyUser(user))
    );
  }

  private async destroyUser(user: ScenarioUser) {
    await this.cognito.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.USERPOOL_ID!,
        Username: user.username,
      })
    );
  }

  private request(
    request: Pick<ScenarioStepRequest, 'route' | 'method' | 'body' | 'user'>
  ) {
    const route =
      typeof request.route === 'string'
        ? request.route
        : request.route(this.cache);

    return fetch(`${process.env.API_URL}${route}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${this.tokens[request.user]}`,
      },
      body:
        request.body !== undefined ? JSON.stringify(request.body) : undefined,
    });
  }

  private async fetchQaLogs({
    eventId,
    before,
    after,
  }: {
    eventId: string;
    before?: Date;
    after?: Date;
  }) {
    const listResponse = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.LOGS_BUCKET,
        Prefix: eventId,
      })
    );

    const logs = await Promise.all(
      listResponse.Contents.map(async (item) => {
        const response = await this.s3.send(
          new GetObjectCommand({
            Bucket: process.env.LOGS_BUCKET,
            Key: item.Key,
          })
        );

        return {
          key: item.Key,
          body: JSON.parse(await response.Body.transformToString()),
        };
      })
    );

    const filteredLogs = logs.filter((log) => {
      const logDate = new Date(path.parse(log.key).name);

      if (before !== undefined && logDate > before) {
        return false;
      }

      if (after !== undefined && logDate < after) {
        return false;
      }

      return true;
    });

    return filteredLogs.map((item) => item.body);
  }
}
