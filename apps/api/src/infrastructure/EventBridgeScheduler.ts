import { EventScheduler, ScheduledEvent } from '@trackflix-live/api-events';
import {
  EventBridgeClient,
  PutRuleCommand,
  PutRuleRequest,
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

    try {
      const cronExpFromDate = CronConversion.toCronExpression(time);

      const input: PutRuleRequest = {
        Name: id,
        ScheduleExpression: cronExpFromDate,
        State: RuleState.ENABLED,
      };

      await this.client.send(new PutRuleCommand(input));
    } catch (error) {
      console.error(
        `Failed to schedule event with id: ${id} and time: ${time}`
      );
      throw error;
    }
  }
}
