import {
  PactV3,
  SpecificationVersion,
  MatchersV3,
} from '@pact-foundation/pact';
import * as path from 'path';
import { EventsRepositoryApi } from './events-repository.api';
const { eachLike, like } = MatchersV3;

const provider = new PactV3({
  consumer: 'ApiClient',
  provider: 'RestApi',
  logLevel: 'warn',
  dir: path.resolve(__dirname, '..', '..', '..', '..', '..', 'pacts'),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
});

describe('Events API Pact test', () => {
  describe('Listing events', () => {
    test('events exists', async () => {
      // set up Pact interactions
      provider.addInteraction({
        states: [{ description: 'events exist' }],
        uponReceiving: 'get all events',
        withRequest: {
          method: 'GET',
          path: '/events',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            events: eachLike({
              id: '1',
              name: 'My first event',
            }),
          }),
        },
      });

      await provider.executeTest(async (mockService) => {
        const api = new EventsRepositoryApi({
          baseURL: mockService.url,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // make request to Pact mock server
        const events = await api.listEvents({ queryStringParameters: {} });

        expect(events).toStrictEqual({
          events: [{ id: '1', name: 'My first event' }],
        });
      });
    });
  });

  describe('Viewing an event', () => {
    test('events exists', async () => {
      // set up Pact interactions
      provider.addInteraction({
        states: [{ description: 'event with id 10 exists' }],
        uponReceiving: 'get event with id 10',
        withRequest: {
          method: 'GET',
          path: '/event/10',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            event: like({
              id: '1',
              name: 'My first event',
            }),
          }),
        },
      });

      await provider.executeTest(async (mockService) => {
        const api = new EventsRepositoryApi({
          baseURL: mockService.url,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // make request to Pact mock server
        const events = await api.getEvent('10');

        expect(events).toStrictEqual({
          event: {
            id: '1',
            name: 'My first event',
          },
        });
      });
    });
  });
});
