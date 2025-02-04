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

  constructor(client: EventBridgeClient) {
    this.client = client;
  }

  public async scheduleEvent(scheduledEvent: ScheduledEvent) {
    const { id, time } = scheduledEvent;
    console.log(
      `Scheduling event with id: ${id} and time: ${
        Number.isNaN(time.getTime()) ? '?' : time.toISOString()
      }`
    );

    const name = `TrackflixLiveTx-${id}`;
    const cronExpFromDate = CronConversion.toCronExpression(time);

    await this.client.send(
      new PutRuleCommand({
        Name: name,
        ScheduleExpression: cronExpFromDate,
        State: RuleState.ENABLED,
      })
    );

    await this.client.send(
      new PutTargetsCommand({
        Rule: name,
        Targets: [
          {
            Id: name + '-Target',
            Arn: process.env.START_TX_LAMBDA,
            Input: JSON.stringify({
              eventId: id,
            }),
          },
        ],
      })
    );
  }
}
