import { mockClient } from 'aws-sdk-client-mock';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { TransmissionsManagerSfn } from './TransmissionsManagerSfn';

describe('Transmissions Manager Sfn', () => {
  const mock = mockClient(SFNClient);

  beforeEach(() => {
    mock.reset();
  });

  it('should start state machine execution', async () => {
    const { transmissionsManager, stateMachineArn } = setup();
    const eventId = '49688a8e-2ab8-45f8-97fe-f0b649442bf4';
    const executionArn =
      'arn:aws:states:us-west-2:000000000000:execution:trackflix-live-test-StartTransmission:TrackflixStartTx-b7dc26e1-f863-4598-ac83-5f358715087c';

    mock.on(StartExecutionCommand).resolves({ executionArn });

    await transmissionsManager.startTransmission(eventId);

    const commandCalls = mock.commandCalls(StartExecutionCommand);
    expect(commandCalls).toHaveLength(1);
    expect(commandCalls[0].args[0].input).toEqual({
      stateMachineArn,
      name: 'TrackflixStartTx-49688a8e-2ab8-45f8-97fe-f0b649442bf4',
      input: expect.any(String),
    });
    expect(JSON.parse(commandCalls[0].args[0].input.input || '{}')).toEqual({
      eventId,
    });
  });
});

const setup = () => {
  const client = new SFNClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const stateMachineArn =
    'arn:aws:states:us-west-2:000000000000:stateMachine:trackflix-live-test-StartTransmission';
  const transmissionsManager = new TransmissionsManagerSfn({
    client,
    stateMachineArn,
  });

  return { stateMachineArn, transmissionsManager };
};
