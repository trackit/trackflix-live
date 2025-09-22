import { GoldenRunner } from '../../framework/GoldenRunner';
import { Scenario, ScenarioStepType } from '../../framework/scenario';

const viewer = 'viewer@trackit.io';
const creator = 'creator@trackit.io';

const onAirStartTime = new Date();
onAirStartTime.setMinutes(onAirStartTime.getMinutes() + 30);

const onAirEndTime = new Date(onAirStartTime);
onAirEndTime.setSeconds(onAirEndTime.getSeconds() + 60);

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
      name: 'Viewer tries to delete an event',
      type: ScenarioStepType.REQUEST,

      user: viewer,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'DELETE',

      expectedStatusCode: 403,
      expectedResponse: {
        message: 'Forbidden',
        description: 'You are not authorized to perform this action.',
      },
    },
    {
      name: 'Creator deletes an event',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'DELETE',

      expectedStatusCode: 200,
      expectedResponse: {
        status: 'Ok',
      },
    },
    {
      name: 'Event does not exist',
      type: ScenarioStepType.REQUEST,

      user: viewer,
      route: (cache: Record<string, string>) =>
        `/event/${
          JSON.parse(cache['Creator creates an event'])['event']['id']
        }`,
      method: 'GET',

      expectedStatusCode: 404,
      expectedResponse: {
        message: 'Not Found',
      },
    },
  ],
};

describe.skip('GOLDEN-002', () => {
  const runner = new GoldenRunner(scenario);
  runner.run();
});
