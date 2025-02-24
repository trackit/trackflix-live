import { mockClient } from 'aws-sdk-client-mock';
import { EventBridgeScheduler } from './EventBridgeScheduler';
import {
  EventBridgeClient,
  PutTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import { PutRuleCommand } from '@aws-sdk/client-eventbridge';

describe('EventBridgeScheduler', () => {
  const mock = mockClient(EventBridgeClient);

  beforeEach(() => {
    mock.reset();
  });

  it('should schedule an event', async () => {
    const { scheduler, target } = setup();
    const eventId = '005fc3b5-623c-41f6-8885-22dc72f30676';

    await scheduler.scheduleEvent({
      name: 'TrackflixLiveTx',
      id: eventId,
      time: new Date('2022-01-01T00:00:00Z'),
    });

    const putRuleCommandCalls = mock.commandCalls(PutRuleCommand);
    expect(putRuleCommandCalls).toHaveLength(1);
    expect(putRuleCommandCalls[0].args[0].input).toEqual({
      Name: `TrackflixLiveTx-${eventId}`,
      ScheduleExpression: 'cron(0 0 1 1 ? 2022)',
      State: 'ENABLED',
    });

    const putTargetsCommandCalls = mock.commandCalls(PutTargetsCommand);
    expect(putTargetsCommandCalls).toHaveLength(1);
    expect(putTargetsCommandCalls[0].args[0].input).toEqual({
      Rule: 'TrackflixLiveTx-005fc3b5-623c-41f6-8885-22dc72f30676',
      Targets: [
        {
          Id: 'TrackflixLiveTx-005fc3b5-623c-41f6-8885-22dc72f30676-Target',
          Input: expect.any(String),
          Arn: target,
        },
      ],
    });
    expect(
      JSON.parse(
        putTargetsCommandCalls[0].args[0].input.Targets?.[0].Input || '{}'
      )
    ).toEqual({
      eventId,
    });
  });

  it('should throw an error when scheduling an event fails', async () => {
    const { scheduler } = setup();
    mock.on(PutRuleCommand).rejects(new Error('Failed to schedule event'));

    await expect(
      scheduler.scheduleEvent({
        name: 'test-event',
        id: 'my-scheduled-event',
        time: new Date('2022-01-01T00:00:00Z'),
      })
    ).rejects.toThrow('Failed to schedule event');
  });

  it('should throw an error if an invalid Date is passed', async () => {
    const { scheduler } = setup();

    await expect(
      scheduler.scheduleEvent({
        name: 'test-event',
        id: 'my-scheduled-event',
        time: new Date('Invalid date'),
      })
    ).rejects.toThrow('Invalid date');
  });
});

const setup = () => {
  const client = new EventBridgeClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const target = 'fake_target';
  const scheduler = new EventBridgeScheduler({ client, target });

  return { client, scheduler, target };
};
