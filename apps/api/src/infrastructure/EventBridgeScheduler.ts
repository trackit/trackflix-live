import { EventScheduler, ScheduledEvent } from '@trackflix-live/api-events';
import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
  RuleState,
} from '@aws-sdk/client-eventbridge';
import { CronConversion } from '@trackflix-live/formatting';

export class EventBridgeScheduler implements EventScheduler {
  private readonly client: EventBridgeClient;

  private readonly target: string;

  constructor({
    client,
    target,
  }: {
    client: EventBridgeClient;
    target: string;
  }) {
    this.client = client;
    this.target = target;
  }

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    const { id, time, name } = scheduledEvent;
    console.log(
      `Scheduling event ${name} with id: ${id} and time: ${
        Number.isNaN(time.getTime()) ? '?' : time.toISOString()
      }`
    );

    const finalName = `${name}-${id}`;
    const cronExpFromDate = CronConversion.toCronExpression(time);

    await this.client.send(
      new PutRuleCommand({
        Name: finalName,
        ScheduleExpression: cronExpFromDate,
        State: RuleState.DISABLED, // TODO: Enable once resources destruction is working
      })
    );

    await this.client.send(
      new PutTargetsCommand({
        Rule: finalName,
        Targets: [
          {
            Id: finalName + '-Target',
            Arn: this.target,
            Input: JSON.stringify({
              eventId: id,
            }),
          },
        ],
      })
    );
  }
}
