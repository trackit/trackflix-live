import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import {
  EventUpdateSender,
  EventUpdateValue,
} from '@trackflix-live/api-events';
import { EventUpdateAction } from '@trackflix-live/types';

export class EventsIotUpdateSender implements EventUpdateSender {
  private readonly client: IoTDataPlaneClient;

  private readonly iotTopicName: string;

  constructor(client: IoTDataPlaneClient, iotTopicName: string) {
    this.client = client;
    this.iotTopicName = iotTopicName;
  }

  public async send(action: EventUpdateAction, value: EventUpdateValue) {
    await this.client.send(
      new PublishCommand({
        topic: this.iotTopicName,
        payload: new TextEncoder().encode(
          JSON.stringify({
            action,
            ...value,
          })
        ),
      })
    );
  }
}
