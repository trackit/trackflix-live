import { mockClient } from 'aws-sdk-client-mock';
import { EventBridgeScheduler } from './EventBridgeScheduler';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { PutRuleCommand } from '@aws-sdk/client-eventbridge';

describe('EventBridgeScheduler', () => {
  const mock = mockClient(EventBridgeClient);

  beforeEach(() => {
    mock.reset();
  });

  it('should schedule an event', async () => {
    const { scheduler } = setup();
    mock.on(PutRuleCommand).resolves({});

    await scheduler.scheduleEvent({
      id: 'my-scheduled-event',
      time: new Date('2022-01-01T00:00:00Z'),
    });

    const putCommandCalls = mock.commandCalls(PutRuleCommand);
    expect(putCommandCalls).toHaveLength(1);
    expect(putCommandCalls[0].args[0].input).toEqual({
      Name: 'my-scheduled-event',
      ScheduleExpression: 'cron(0 0 1 1 ? 2022)',
      State: 'ENABLED',
    });
  });

  it('should throw an error when scheduling an event fails', async () => {
    const { scheduler } = setup();
    mock.on(PutRuleCommand).rejects(new Error('Failed to schedule event'));

    await expect(
      scheduler.scheduleEvent({
        id: 'my-scheduled-event',
        time: new Date('2022-01-01T00:00:00Z'),
      })
    ).rejects.toThrow('Failed to schedule event');
  });

  it('should throw an error if an invalid Date is passed', async () => {
    const { scheduler } = setup();

    await expect(
      scheduler.scheduleEvent({
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
  const scheduler = new EventBridgeScheduler(client);

  return { client, scheduler };
};
