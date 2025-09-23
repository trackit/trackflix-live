import { Scenario, ScenarioUser } from './Scenario';
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  MessageActionType,
} from '@aws-sdk/client-cognito-identity-provider';

export class GoldenUsersManager {
  private readonly cognito: CognitoIdentityProviderClient =
    new CognitoIdentityProviderClient();

  private readonly tokens: Record<string, string> = {};

  private readonly userpoolId: string;

  private readonly clientId: string;

  public constructor({
    userpoolId,
    clientId,
  }: {
    userpoolId: string;
    clientId: string;
  }) {
    this.userpoolId = userpoolId;
    this.clientId = clientId;
  }

  public async setupUsers(scenario: Scenario) {
    await Promise.all(scenario.users.map(async (user) => this.setupUser(user)));
  }

  private async setupUser(user: ScenarioUser) {
    await this.cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userpoolId,
        Username: user.username,
        TemporaryPassword: 'Qa@Trackit2025$',
        MessageAction: MessageActionType.SUPPRESS,
      })
    );

    await this.cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: this.userpoolId,
        Username: user.username,
        Password: 'Qa@Trackit2025$',
        Permanent: true,
      })
    );

    if (user.isCreator === true) {
      await this.cognito.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: this.userpoolId,
          Username: user.username,
          GroupName: 'Creators',
        })
      );
    }

    const authResponse = await this.cognito.send(
      new AdminInitiateAuthCommand({
        UserPoolId: this.userpoolId,
        ClientId: this.clientId,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: user.username,
          PASSWORD: 'Qa@Trackit2025$',
        },
      })
    );

    this.tokens[user.username] = authResponse.AuthenticationResult.IdToken;
  }

  public async destroyUsers(scenario: Scenario) {
    await Promise.all(
      scenario.users.map(async (user) => this.destroyUser(user))
    );
  }

  private async destroyUser(user: ScenarioUser) {
    await this.cognito.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userpoolId,
        Username: user.username,
      })
    );
  }

  public getUserToken(user: string): string | undefined {
    return this.tokens[user];
  }
}
