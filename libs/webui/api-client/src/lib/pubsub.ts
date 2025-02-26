import { PubSub } from '@aws-amplify/pubsub';

export const pubsub = new PubSub({
  region: import.meta.env.VITE_AWS_REGION,
  endpoint: `wss://${import.meta.env.VITE_IOT_DOMAIN_NAME}/mqtt`,
});
