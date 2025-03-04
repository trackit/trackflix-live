import { mockClient } from 'aws-sdk-client-mock';
import { EventBridgeScheduler } from './EventBridgeScheduler';
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler';

describe('EventBridgeScheduler', () => {
  const mock = mockClient(SchedulerClient);

  beforeEach(() => {
    mock.reset();
  });

  describe('scheduleEvent', () => {
    it('should schedule an event', async () => {
      const { scheduler, target, roleArn } = setup();
      const eventId = '005fc3b5-623c-41f6-8885-22dc72f30676';

      await scheduler.scheduleEvent({
        name: 'TrackflixLiveTx',
        id: eventId,
        time: new Date('2022-01-01T00:00:00Z'),
      });

      const createScheduleCommandCalls = mock.commandCalls(
        CreateScheduleCommand
      );
      expect(createScheduleCommandCalls).toHaveLength(1);
      expect(createScheduleCommandCalls[0].args[0].input).toEqual({
        Name: `TrackflixLiveTx-${eventId}`,
        ScheduleExpression: 'at(2022-01-01T00:00:00)',
        ActionAfterCompletion: 'DELETE',
        Target: {
          Input: expect.any(String),
          Arn: target,
          RoleArn: roleArn,
        },
        FlexibleTimeWindow: {
          Mode: 'OFF',
        },
      });
      expect(
        JSON.parse(
          createScheduleCommandCalls[0].args[0].input.Target?.Input || '{}'
        )
      ).toEqual({
        eventId,
      });
    });

    it('should throw an error when scheduling an event fails', async () => {
      const { scheduler } = setup();
      mock
        .on(CreateScheduleCommand)
        .rejects(new Error('Failed to schedule event'));

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

  describe('deleteSchedule', () => {
    it('should delete schedule', async () => {
      const { scheduler } = setup();

      await scheduler.deleteSchedule('test-event');
    });

    it('should throw an error if the delete schedule throws an error', async () => {
      const { scheduler } = setup();
      mock
        .on(DeleteScheduleCommand)
        .rejects(new Error('Failed to delete schedule'));

      await expect(scheduler.deleteSchedule('test-event')).rejects.toThrow(
        'Failed to delete schedule'
      );
    });
  });
});

const setup = () => {
  const client = new SchedulerClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const target = 'fake_target';
  const roleArn = 'fake_role_arn';
  const scheduler = new EventBridgeScheduler({ client, target, roleArn });

  return { client, scheduler, target, roleArn };
};
