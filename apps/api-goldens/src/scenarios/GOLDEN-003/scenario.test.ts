import { GoldenRunner } from '../../framework/GoldenRunner';
import { Scenario, ScenarioStepType } from '../../framework/Scenario';

const creator = 'creator@trackit.io';

const onAirStartTimeA = new Date();
onAirStartTimeA.setMinutes(onAirStartTimeA.getMinutes() + 33);

const onAirStartTimeB = new Date();
onAirStartTimeB.setMinutes(onAirStartTimeB.getMinutes() + 31);

const onAirStartTimeC = new Date();
onAirStartTimeC.setMinutes(onAirStartTimeC.getMinutes() + 35);

const onAirEndTime = new Date(onAirStartTimeA);
onAirEndTime.setMinutes(onAirEndTime.getMinutes() + 10);

const scenario: Scenario = {
  users: [
    {
      username: creator,
      isCreator: true,
    },
  ],
  steps: [
    {
      name: 'Creator creates an event 1',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/event',
      method: 'POST',
      body: {
        name: 'QA event A',
        description: 'This is a testing event',
        onAirStartTime: onAirStartTimeA,
        onAirEndTime,
        source: 's3://trackflix-live-demo-videos/bbb.mp4',
      },

      expectedStatusCode: 200,
    },
    {
      name: 'Creator creates an event 2',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/event',
      method: 'POST',
      body: {
        name: 'QA event B',
        description: 'This is a testing event',
        onAirStartTime: onAirStartTimeB,
        onAirEndTime,
        source: 's3://trackflix-live-demo-videos/bbb.mp4',
      },

      expectedStatusCode: 200,
    },
    {
      name: 'Creator creates an event 3',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/event',
      method: 'POST',
      body: {
        name: 'QA event C',
        description: 'This is a testing event',
        onAirStartTime: onAirStartTimeC,
        onAirEndTime,
        source: 's3://trackflix-live-demo-videos/bbb.mp4',
      },

      expectedStatusCode: 200,
    },
    {
      name: 'Creator list events',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/events',
      method: 'GET',

      expectedStatusCode: 200,
      expectedResponse: {
        events: expect.arrayContaining([
          expect.objectContaining({
            name: 'QA event A',
          }),
          expect.objectContaining({
            name: 'QA event B',
          }),
          expect.objectContaining({
            name: 'QA event C',
          }),
        ]),
      },
    },
    {
      name: 'Creator list events (sorted)',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/events?sortBy=name',
      method: 'GET',

      expectedStatusCode: 200,
      expectedResponse: {
        events: [
          {
            name: 'QA event A',
          },
          {
            name: 'QA event B',
          },
          {
            name: 'QA event C',
          },
        ],
      },
    },
    {
      name: 'Creator list events (filtered)',
      type: ScenarioStepType.REQUEST,

      user: creator,
      route: '/events?name=QA event C',
      method: 'GET',

      expectedStatusCode: 200,
      expectedResponse: {
        events: [
          {
            name: 'QA event C',
          },
        ],
      },
    },
  ],
};

describe('GOLDEN-003', () => {
  const runner = new GoldenRunner(scenario);
  runner.run();
});
