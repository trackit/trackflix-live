import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import { EventUpdateSender } from '@trackflix-live/api-events';
import { EventUpdate } from '@trackflix-live/types';
import { AttachPolicyCommand, IoTClient } from '@aws-sdk/client-iot';

export class EventsIotUpdateSender implements EventUpdateSender {
  private readonly client: IoTClient;

  private readonly dataPlaneClient: IoTDataPlaneClient;

  private readonly iotTopicName: string;

  private readonly iotPolicy: string;

  constructor({
    client,
    dataPlaneClient,
    iotTopicName,
    iotPolicy,
  }: {
    client: IoTClient;
    dataPlaneClient: IoTDataPlaneClient;
    iotTopicName: string;
    iotPolicy: string;
  }) {
    this.dataPlaneClient = dataPlaneClient;
    this.client = client;
    this.iotTopicName = iotTopicName;
    this.iotPolicy = iotPolicy;
  }

  public async send(eventUpdate: EventUpdate) {
    await this.dataPlaneClient.send(
      new PublishCommand({
        topic: this.iotTopicName,
        payload: new TextEncoder().encode(JSON.stringify(eventUpdate)),
      })
    );
  }

  public async attachPolicyToIdentity(identityId: string): Promise<void> {
    await this.client.send(
      new AttachPolicyCommand({
        policyName: this.iotPolicy,
        target: identityId,
      })
    );
  }
}
