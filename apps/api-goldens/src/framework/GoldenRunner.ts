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

export class GoldenRunner {
  private readonly scenario: Scenario;

  private readonly cognito: CognitoIdentityProviderClient =
    new CognitoIdentityProviderClient();

  private readonly tokens: Record<string, string> = {};

  public constructor(scenario: Scenario) {
    this.scenario = scenario;
  }

  public async run() {
    beforeAll(async () => {
      await this.setupUsers();
    });

    afterAll(async () => {
      await this.destroyUsers();
    });

    for (const step of this.scenario.steps) {
      it(step.name, async () => {
        switch (step.type) {
          case ScenarioStepType.REQUEST: {
            const response = await this.request(step);

            expect(response.status).toEqual(
              step.expectedStatusCode !== undefined
                ? step.expectedStatusCode
                : 200
            );

            if (typeof step.expectedResponse === 'string') {
              expect(await response.text()).toEqual(step.expectedResponse);
            } else if (step.expectedResponse !== undefined) {
              expect(await response.json()).toMatchObject(
                step.expectedResponse
              );
            }

            break;
          }
        }
      });
    }
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

  private request(request: ScenarioStepRequest) {
    return fetch(`${process.env.API_URL}${request.route}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${this.tokens[request.user]}`,
      },
      body:
        request.body !== undefined ? JSON.stringify(request.body) : undefined,
    });
  }
}
