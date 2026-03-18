import { EventsDynamoDBRepository } from './EventsDynamoDBRepository';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import {
  EndpointType,
  EventEndpoint,
  EventMother,
  EventStatus,
  LogType,
} from '@trackflix-live/types';
import { EventDoesNotExistError } from '@trackflix-live/api-events';

describe('EventsDynamoDBRepository', () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const tableName = 'EventsTable';
  const repository = new EventsDynamoDBRepository(
    ddbMock as unknown as DynamoDBDocumentClient,
    tableName
  );

  beforeEach(() => {
    ddbMock.reset();
  });

  describe('createEvent', () => {
    it('should create an event in DynamoDB', async () => {
      const sampleEvent = EventMother.basic().build();
      await repository.createEvent(sampleEvent);

      expect(ddbMock.commandCalls(PutCommand)).toHaveLength(1);
      expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toMatchObject({
        TableName: tableName,
        Item: sampleEvent,
      });
    });
  });

  describe('listEvents', () => {
    it('should list events from DynamoDB', async () => {
      const sampleEvent = EventMother.basic().build();
      ddbMock.on(ScanCommand).resolves({
        Items: [sampleEvent],
      });

      const response = await repository.listEvents({ limit: 10 });

      expect(response.events).toMatchObject([sampleEvent]);
      expect(response.nextToken).toBeNull();
    });

    it('should return events in multiple requests if limit is less than the number of events', async () => {
      ddbMock.on(ScanCommand).resolves({
        Items: [
          EventMother.basic()
            .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
            .build(),
        ],
        LastEvaluatedKey: { id: '37bfc238-6ef4-45a4-b874-9d8c2525ac5f' },
      });

      const response = await repository.listEvents({ limit: 1 });

      expect(response.events.length).toBe(1);
      expect(response.nextToken).toBeDefined();

      ddbMock.on(ScanCommand).resolves({
        Items: [
          EventMother.basic()
            .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
            .build(),
          EventMother.basic()
            .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
            .build(),
        ],
      });

      const response2 = await repository.listEvents({
        limit: 3,
        nextToken: response.nextToken as string,
      });

      expect(response2.events.length).toBe(2);
      expect(response2.nextToken).toBeNull();
    });

    it('should list and sort items by a given attribute in asc order', async () => {
      const event1 = EventMother.basic()
        .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
        .withName('Event 1')
        .build();
      const event2 = EventMother.basic()
        .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
        .withName('Event 2')
        .build();
      const event3 = EventMother.basic()
        .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
        .withName('Event 3')
        .build();

      ddbMock.on(QueryCommand).resolves({
        Items: [event1, event2, event3],
      });

      const response = await repository.listEvents({
        limit: 10,
        sortBy: 'name',
      });

      expect(response.events).toMatchObject([event1, event2, event3]);
    });

    it('should list and sort items by a given attribute in desc order', async () => {
      const event1 = EventMother.basic()
        .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
        .withName('Event 1')
        .build();
      const event2 = EventMother.basic()
        .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
        .withName('Event 2')
        .build();
      const event3 = EventMother.basic()
        .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
        .withName('Event 3')
        .build();

      ddbMock.on(QueryCommand).resolves({
        Items: [event3, event2, event1],
      });

      const response = await repository.listEvents({
        limit: 10,
        sortBy: 'name',
        sortOrder: 'desc',
      });

      expect(response.events).toMatchObject([event3, event2, event1]);
    });

    it('should list and sort items by a given attribute in asc order and using pagination', async () => {
      const event1 = EventMother.basic()
        .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
        .withName('Event 1')
        .build();
      const event2 = EventMother.basic()
        .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
        .withName('Event 2')
        .build();
      const event3 = EventMother.basic()
        .withId('a69fd9cb-a581-4797-a5c6-2e6bdfd18e70')
        .withName('Event 3')
        .build();

      ddbMock.on(QueryCommand).resolves({
        Items: [event1, event2],
        LastEvaluatedKey: { id: event2.id },
      });

      const response = await repository.listEvents({
        limit: 2,
        sortBy: 'name',
      });

      expect(response.events).toMatchObject([event1, event2]);

      ddbMock.on(QueryCommand).resolves({
        Items: [event3],
      });

      const response2 = await repository.listEvents({
        limit: 10,
        sortBy: 'name',
        nextToken: response.nextToken as string,
      });

      expect(response2.events).toMatchObject([event3]);
    });

    it('should return results matching name when specified', async () => {
      const event1 = EventMother.basic()
        .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
        .withName('Moto GP Race')
        .build();

      ddbMock.on(ScanCommand).resolves({
        Items: [event1],
      });

      const response = await repository.listEvents({
        limit: 10,
        name: 'RaCe',
      });

      expect(response.events).toEqual([event1]);
    });

    it('should return results matching name when specified in any order', async () => {
      const event1 = EventMother.basic()
        .withId('37bfc238-6ef4-45a4-b874-9d8c2525ac5f')
        .withName('Moto GP Race')
        .build();
      const event2 = EventMother.basic()
        .withId('7bb6463a-0fe0-4a25-a0c0-04fa14f66f5e')
        .withName('F1 Race car')
        .build();

      ddbMock.on(QueryCommand).resolves({
        Items: [event1, event2],
      });

      const response = await repository.listEvents({
        limit: 10,
        name: 'race',
        sortBy: 'name',
        sortOrder: 'desc',
      });

      expect(response.events).toMatchObject([event1, event2]);
    });
  });

  describe('getEvent', () => {
    it('should get an event from DynamoDB', async () => {
      const sampleEvent = EventMother.basic().build();
      ddbMock.on(GetCommand).resolves({
        Item: sampleEvent,
      });

      const response = await repository.getEvent(sampleEvent.id);

      expect(response).toMatchObject(sampleEvent);
    });
  });

  describe('appendLogsToEvent', () => {
    it('should append logs to an event', async () => {
      const sampleEvent = EventMother.basic().build();
      const log = {
        timestamp: Date.now(),
        type: LogType.PACKAGE_CHANNEL_CREATED,
      };

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          logs: [log],
        },
      });

      await repository.appendLogsToEvent(sampleEvent.id, [log]);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
      expect(
        ddbMock.commandCalls(UpdateCommand)[0].args[0].input
      ).toMatchObject({
        TableName: tableName,
        Key: { id: sampleEvent.id },
      });
    });
  });

  describe('updateEventStatus', () => {
    it('should update event status', async () => {
      const sampleEvent = EventMother.basic()
        .withStatus(EventStatus.PRE_TX)
        .build();

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          status: EventStatus.TX,
        },
      });

      await repository.updateEventStatus(sampleEvent.id, EventStatus.TX);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateLiveChannelArn', () => {
    it('should update event live channel arn', async () => {
      const sampleEvent = EventMother.basic().build();
      const liveChannelArn =
        'arn:aws:medialive:us-west-2:000000000000:channel:1672338';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          liveChannelArn,
        },
      });

      await repository.updateLiveChannelArn(sampleEvent.id, liveChannelArn);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateLiveChannelId', () => {
    it('should update event live channel id', async () => {
      const sampleEvent = EventMother.basic().build();
      const liveChannelId = '1672338';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          liveChannelId,
        },
      });

      await repository.updateLiveChannelId(sampleEvent.id, liveChannelId);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateLiveInputId', () => {
    it('should update event live input id', async () => {
      const sampleEvent = EventMother.basic().build();
      const liveInputId = '1672338';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          liveInputId,
        },
      });

      await repository.updateLiveInputId(sampleEvent.id, liveInputId);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateLiveWaitingInputId', () => {
    it('should update event live waiting input id', async () => {
      const sampleEvent = EventMother.basic().build();
      const liveWaitingInputId = '1672338';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          liveWaitingInputId,
        },
      });

      await repository.updateLiveWaitingInputId(
        sampleEvent.id,
        liveWaitingInputId
      );

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateEventDestroyedTime', () => {
    it('should update event destroyed time', async () => {
      const sampleEvent = EventMother.basic().build();
      const destroyedTime = '2025-02-25T15:56:34.400Z';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          destroyedTime,
        },
      });

      await repository.updateEventDestroyedTime(sampleEvent.id, destroyedTime);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updatePackageDomainName', () => {
    it('should update event package domain name', async () => {
      const sampleEvent = EventMother.basic().build();
      const packageDomainName = 'example-domain.cloudfront.net';

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          packageDomainName,
        },
      });

      await repository.updatePackageDomainName(
        sampleEvent.id,
        packageDomainName
      );

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('updateEventEndpoints', () => {
    it('should update event endpoints', async () => {
      const sampleEvent = EventMother.basic().build();
      const endpoints: EventEndpoint[] = [
        {
          type: EndpointType.HLS,
          url: 'https://example.com/hls/stream.m3u8',
        },
      ];

      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          ...sampleEvent,
          endpoints,
        },
      });

      await repository.updateEndpoints(sampleEvent.id, endpoints);

      expect(ddbMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event from DynamoDB', async () => {
      ddbMock.on(DeleteCommand).resolves({});

      await repository.deleteEvent('some-id');
      expect(ddbMock.commandCalls(DeleteCommand)).toHaveLength(1);
    });

    it('should throw a NotFoundError when deleting an item that does not exist', async () => {
      ddbMock.on(DeleteCommand).rejects(
        new ConditionalCheckFailedException({
          message: 'Item does not exist',
          $metadata: {},
        })
      );

      await expect(repository.deleteEvent('non-existing-id')).rejects.toThrow(
        EventDoesNotExistError
      );
    });
  });
});
