import {
  ResumeStartTransmissionParameters,
  TransmissionsManager,
} from '@trackflix-live/api-events';
import {
  SendTaskSuccessCommand,
  SFNClient,
  StartExecutionCommand,
} from '@aws-sdk/client-sfn';

export class TransmissionsManagerSfn implements TransmissionsManager {
  private readonly client: SFNClient;

  private readonly startTransmissionStateMachineArn: string;

  private readonly stopTransmissionStateMachineArn: string;

  public constructor({
    client,
    startTransmissionStateMachineArn,
    stopTransmissionStateMachineArn,
  }: {
    client: SFNClient;
    startTransmissionStateMachineArn: string;
    stopTransmissionStateMachineArn: string;
  }) {
    this.client = client;
    this.startTransmissionStateMachineArn = startTransmissionStateMachineArn;
    this.stopTransmissionStateMachineArn = stopTransmissionStateMachineArn;
  }

  public async startTransmission(eventId: string): Promise<void> {
    const name = `TrackflixLiveStartTx-${eventId}`;

    const res = await this.client.send(
      new StartExecutionCommand({
        stateMachineArn: this.startTransmissionStateMachineArn,
        name,
        input: JSON.stringify({
          eventId,
        }),
      })
    );

    console.log(
      `Start state machine started. Execution ARN: ${res.executionArn}`
    );
  }

  public async resumeStartTransmission(
    parameters: ResumeStartTransmissionParameters
  ): Promise<void> {
    await this.client.send(
      new SendTaskSuccessCommand({
        taskToken: parameters.taskToken,
        output: JSON.stringify(parameters.output),
      })
    );
  }

  public async stopTransmission(eventId: string): Promise<void> {
    const name = `TrackflixLiveStopTx-${eventId}`;

    const res = await this.client.send(
      new StartExecutionCommand({
        stateMachineArn: this.stopTransmissionStateMachineArn,
        name,
        input: JSON.stringify({
          eventId,
        }),
      })
    );

    console.log(
      `Stop state machine started. Execution ARN: ${res.executionArn}`
    );
  }
}
