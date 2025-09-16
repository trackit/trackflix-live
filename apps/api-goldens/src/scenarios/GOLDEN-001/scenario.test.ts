import { GoldenRunner } from '../../framework/GoldenRunner';
import { Scenario, ScenarioStepType } from '../../framework/scenario';

const viewer = 'viewer@trackit.io';
const creator = 'creator@trackit.io';

const onAirStartTime = new Date();
onAirStartTime.setSeconds(onAirStartTime.getSeconds() + 90);

const onAirEndTime = new Date(onAirStartTime);
onAirEndTime.setSeconds(onAirEndTime.getSeconds() + 30);

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
  ],
};

describe('GOLDEN-001', () => {
  const runner = new GoldenRunner(scenario);
  runner.run();
});
