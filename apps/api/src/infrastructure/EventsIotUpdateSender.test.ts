import { mockClient } from 'aws-sdk-client-mock';
import { EventsIotUpdateSender } from './EventsIotUpdateSender';
import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import { EventMother, EventUpdateAction } from '@trackflix-live/types';
import { AttachPolicyCommand, IoTClient } from '@aws-sdk/client-iot';

describe('Events Iot Update Sender', () => {
  const dataPlaneMock = mockClient(IoTDataPlaneClient);
  const mock = mockClient(IoTClient);

  beforeEach(() => {
    dataPlaneMock.reset();
    mock.reset();
  });

  describe('send', () => {
    it('should send event update', async () => {
      const { eventsIotUpdateSender, iotTopicName } = setup();
      const event = EventMother.basic().build();

      await eventsIotUpdateSender.send({
        action: EventUpdateAction.EVENT_UPDATE_CREATE,
        value: event,
      });

      dataPlaneMock.on(PublishCommand).resolves({});

      const commandCalls = dataPlaneMock.commandCalls(PublishCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        topic: iotTopicName,
        payload: new TextEncoder().encode(
          JSON.stringify({
            action: EventUpdateAction.EVENT_UPDATE_CREATE,
            value: event,
          })
        ),
      });
    });
  });

  describe('attachPolicyToIdentity', () => {
    it('should attach policy', async () => {
      const { eventsIotUpdateSender, iotPolicy } = setup();
      const identityId = 'my_identity_id';

      await eventsIotUpdateSender.attachPolicyToIdentity(identityId);

      const commandCalls = mock.commandCalls(AttachPolicyCommand);
      expect(commandCalls).toHaveLength(1);
      expect(commandCalls[0].args[0].input).toEqual({
        target: identityId,
        policyName: iotPolicy,
      });
    });
  });
});

const setup = () => {
  const dataPlaneClient = new IoTDataPlaneClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const client = new IoTClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const iotTopicName = 'fakeIotTopic';
  const iotPolicy = 'fakeIotPolicy';

  const eventsIotUpdateSender = new EventsIotUpdateSender({
    dataPlaneClient,
    client,
    iotTopicName,
    iotPolicy,
  });

  return {
    dataPlaneClient,
    client,
    iotTopicName,
    iotPolicy,
    eventsIotUpdateSender,
  };
};
