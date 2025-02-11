import { TransmissionsManager } from '@trackflix-live/api-events';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

export class TransmissionsManagerSfn implements TransmissionsManager {
  private readonly client: SFNClient;

  private readonly stateMachineArn: string;

  public constructor({
    client,
    stateMachineArn,
  }: {
    client: SFNClient;
    stateMachineArn: string;
  }) {
    this.client = client;
    this.stateMachineArn = stateMachineArn;
  }

  public async startTransmission(eventId: string): Promise<void> {
    const name = `TrackflixStartTx-${eventId}`;

    const res = await this.client.send(
      new StartExecutionCommand({
        stateMachineArn: this.stateMachineArn,
        name,
        input: JSON.stringify({
          eventId,
        }),
      })
    );

    console.log(`State machine started. Execution ARN: ${res.executionArn}`);
  }
}
