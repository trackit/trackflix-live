import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

export interface StartTransmissionUseCase {
  startTransmission(eventId: string): Promise<void>;
}

export class StartTransmissionUseCaseImpl implements StartTransmissionUseCase {
  public async startTransmission(eventId: string): Promise<void> {
    console.log(`Starting transmission ${eventId}`);

    const sfn = new SFNClient();
    await sfn.send(
      new StartExecutionCommand({
        stateMachineArn: process.env['START_TX_STATE_MACHINE'],
        name: `TrackflixStartTx-${eventId}`,
        input: JSON.stringify({
          eventId,
        }),
      })
    );
  }
}
