import { mockClient } from 'aws-sdk-client-mock';
import { EventsIotUpdateSender } from './EventsIotUpdateSender';
import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import { EventUpdateAction } from '@trackflix-live/types';

describe('Events Iot Update Sender', () => {
  const mock = mockClient(IoTDataPlaneClient);

  beforeEach(() => {
    mock.reset();
  });

  it('should send event update', async () => {
    const { eventsIotUpdateSender } = setup();
    const value = { id: '49688a8e-2ab8-45f8-97fe-f0b649442bf4' };

    await eventsIotUpdateSender.send(EventUpdateAction.NEW_EVENT, value);

    mock.on(PublishCommand).resolves({});

    const commandCalls = mock.commandCalls(PublishCommand);
    expect(commandCalls).toHaveLength(1);
    expect(commandCalls[0].args[0].input).toEqual({
      topic: 'fakeIotTopic',
      payload: new TextEncoder().encode(
        JSON.stringify({
          action: EventUpdateAction.NEW_EVENT,
          ...value,
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
