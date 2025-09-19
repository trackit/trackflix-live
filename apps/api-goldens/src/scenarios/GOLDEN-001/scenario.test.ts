import { GoldenRunner } from '../../framework/GoldenRunner';
import { Scenario, ScenarioStepType } from '../../framework/scenario';

const viewer = 'viewer@trackit.io';
const creator = 'creator@trackit.io';

const onAirStartTime = new Date();
onAirStartTime.setSeconds(onAirStartTime.getSeconds() + 90);

const onAirEndTime = new Date(onAirStartTime);
onAirEndTime.setSeconds(onAirEndTime.getSeconds() + 45);

const scenario: Scenario = {
  users: [
    {
      username: viewer,
      isCreator: false,
    },
    {
      username: creator,
      isCreator: true,
    },
  ],
  steps: [
    {
      name: 'Viewer tries to create an event',
      type: ScenarioStepType.REQUEST,

      user: viewer,
      route: '/event',
      method: 'POST',
      body: {
        name: 'My first event',
        description: 'This is a sample testing event',
        onAirStartTime,
        onAirEndTime,
        source: 's3://trackflix-live-demo-videos/bbb.mp4',
      },

      expectedStatusCode: 403,
      expectedResponse: {
        message: 'Forbidden',
        description: 'You are not authorized to perform this action.',
      },
    },
    {
      name: 'Creator creates an event',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/event',
      method: 'POST',
      body: {
        name: 'QA event',
        description: 'This is a testing event',
        onAirStartTime,
        onAirEndTime,
        source: 's3://trackflix-live-demo-videos/bbb.mp4',
      },

      expectedStatusCode: 200,
      expectedResponse: {
        event: {
          createdTime: expect.any(String),
          description: 'This is a testing event',
          endpoints: [],
          id: expect.any(String),
          logs: [],
          name: 'QA event',
          onAirStartTime: onAirStartTime.toISOString(),
          onAirEndTime: onAirEndTime.toISOString(),
          source: 's3://trackflix-live-demo-videos/bbb.mp4',
          status: 'PRE-TX',
        },
      },
    },
    {
      name: 'Wait for live resources creation',
      type: ScenarioStepType.WAIT_FOR_REQUEST,

      secondsBetweenRetries: 15,
      maximumRetries: 10,

      user: creator,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'GET',

      expectedResponse: {
        event: {
          status: 'TX',
        },
      },
    },
    {
      type: ScenarioStepType.VERIFY_RESOURCES,
      name: 'Live resources are created',

      eventId: (cache: Record<string, string>) =>
        JSON.parse(cache['Creator creates an event'])['event']['id'],
      before: onAirStartTime,
      expectedCalls: [
        {
          service: 'Package',
          method: 'createChannel',
          parameters: expect.any(String),
        },
        {
          service: 'Live',
          method: 'createChannel',
          parameters: {
            eventId: expect.any(String),
            packageChannelId: expect.any(String),
            source: 's3://trackflix-live-demo-videos/bbb.mp4',
          },
        },
        {
          service: 'CDN',
          method: 'createOrigin',
          parameters: {
            endpoints: [
              {
                type: 'HLS',
                url: 'MOCK_HLS_ENDPOINT',
              },
              {
                type: 'DASH',
                url: 'MOCK_DASH_ENDPOINT',
              },
            ],
            eventId: expect.any(String),
            packageDomainName: 'MOCK_HLS_ENDPOINT',
          },
        },
        {
          service: 'Live',
          method: 'startChannel',
          parameters: {
            channelId: expect.any(String),
            eventId: expect.any(String),
            onAirStartTime: expect.any(String),
          },
        },
      ],
    },
    {
      name: 'Viewer can view the event',
      type: ScenarioStepType.REQUEST,

      user: viewer,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'GET',

      expectedStatusCode: 200,
      expectedResponse: {
        event: {
          createdTime: expect.any(String),
          description: 'This is a testing event',
          endpoints: [
            {
              type: 'HLS',
              url: expect.any(String),
            },
            {
              type: 'DASH',
              url: expect.any(String),
            },
          ],
          id: expect.any(String),
          logs: [
            {
              timestamp: expect.any(Number),
              type: 'PACKAGE_CHANNEL_CREATED',
            },
            {
              timestamp: expect.any(Number),
              type: 'LIVE_INPUT_CREATED',
            },
            {
              timestamp: expect.any(Number),
              type: 'CDN_ORIGIN_CREATED',
            },
            {
              timestamp: expect.any(Number),
              type: 'LIVE_CHANNEL_CREATED',
            },
            {
              timestamp: expect.any(Number),
              type: 'LIVE_CHANNEL_STARTED',
            },
          ],
          name: 'QA event',
          onAirStartTime: onAirStartTime.toISOString(),
          onAirEndTime: onAirEndTime.toISOString(),
          source: 's3://trackflix-live-demo-videos/bbb.mp4',
          status: 'TX',
        },
      },
    },
    {
      name: 'Wait for live resources destruction',
      type: ScenarioStepType.WAIT_FOR_REQUEST,

      secondsBetweenRetries: 15,
      maximumRetries: 10,

      user: creator,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'GET',

      expectedResponse: {
        event: {
          status: 'ENDED',
        },
      },
    },
    {
      type: ScenarioStepType.VERIFY_RESOURCES,
      name: 'Live resources are destructed',

      eventId: (cache: Record<string, string>) =>
        JSON.parse(cache['Creator creates an event'])['event']['id'],
      after: onAirEndTime,
      expectedCalls: [
        {
          service: 'Live',
          method: 'stopChannel',
          parameters: expect.any(String),
        },
        {
          service: 'Live',
          method: 'deleteChannel',
          parameters: expect.any(String),
        },
        {
          service: 'CDN',
          method: 'deleteOrigin',
          parameters: {
            eventId: expect.any(String),
          },
        },
        {
          service: 'Package',
          method: 'deleteChannel',
          parameters: expect.any(String),
        },
      ],
    },
  ],
};

describe('GOLDEN-001', () => {
  const runner = new GoldenRunner(scenario);
  runner.run();
});
