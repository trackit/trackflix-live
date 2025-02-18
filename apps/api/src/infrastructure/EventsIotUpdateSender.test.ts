import { mockClient } from 'aws-sdk-client-mock';
import { EventsIotUpdateSender } from './EventsIotUpdateSender';
import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import { EventMother, EventUpdateAction } from '@trackflix-live/types';

describe('Events Iot Update Sender', () => {
  const mock = mockClient(IoTDataPlaneClient);

  beforeEach(() => {
    mock.reset();
  });

  it('should send event update', async () => {
    const { eventsIotUpdateSender } = setup();
    const event = EventMother.basic().build();

    await eventsIotUpdateSender.send({
      action: EventUpdateAction.EVENT_UPDATE_CREATE,
      value: event,
    });

    mock.on(PublishCommand).resolves({});

    const commandCalls = mock.commandCalls(PublishCommand);
    expect(commandCalls).toHaveLength(1);
    expect(commandCalls[0].args[0].input).toEqual({
      topic: 'fakeIotTopic',
      payload: new TextEncoder().encode(
        JSON.stringify({
          action: EventUpdateAction.EVENT_UPDATE_CREATE,
          value: event,
        })
      ),
    });
  });
});

const setup = () => {
  const client = new IoTDataPlaneClient({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const eventsIotUpdateSender = new EventsIotUpdateSender(
    client,
    'fakeIotTopic'
  );

  return { client, eventsIotUpdateSender };
};
