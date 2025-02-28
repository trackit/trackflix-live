import { EventScheduler, ScheduledEvent } from '@trackflix-live/api-events';
import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
} from '@aws-sdk/client-scheduler';

export class EventBridgeScheduler implements EventScheduler {
  private readonly client: SchedulerClient;

  private readonly target: string;

  private readonly roleArn: string;

  constructor({
    client,
    target,
    roleArn,
  }: {
    client: SchedulerClient;
    target: string;
    roleArn: string;
  }) {
    this.client = client;
    this.target = target;
    this.roleArn = roleArn;
  }

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    const { id, time, name } = scheduledEvent;

    if (isNaN(time.getTime())) {
      throw new Error('Invalid date');
    }

    console.log(
      `Scheduling event ${name} with id: ${id} and time: ${
        Number.isNaN(time.getTime()) ? '?' : time.toISOString()
      }`
    );

    // Format: at(yyyy-mm-ddThh:mm:ss)
    const scheduleExpression = `at(${time.toISOString().split('.')[0]})`;
    const finalName = `${name}-${id}`;

    await this.client.send(
      new CreateScheduleCommand({
        Name: finalName,
        ScheduleExpression: scheduleExpression,
        ActionAfterCompletion: 'DELETE',
        Target: {
          Arn: this.target,
          RoleArn: this.roleArn,
          Input: JSON.stringify({ eventId: id }),
        },
        FlexibleTimeWindow: {
          Mode: 'OFF',
        },
      })
    );
  }

  public async deleteSchedule(scheduleName: string): Promise<void> {
    const a = await this.client.send(
      new DeleteScheduleCommand({
        Name: scheduleName,
      })
    );
  }
}
