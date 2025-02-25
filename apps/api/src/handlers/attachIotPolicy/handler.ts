import { IoTClient } from '@aws-sdk/client-iot';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { EventsIotUpdateSender } from '../../infrastructure/EventsIotUpdateSender';
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane';
import { AttachIotPolicyUseCaseImpl } from '@trackflix-live/api-events';
import { AttachIotPolicyAdapter } from './attachIotPolicy.adapter';

const eventUpdateSender = new EventsIotUpdateSender({
  dataPlaneClient: new IoTDataPlaneClient({}),
  client: new IoTClient(),
  iotTopicName: process.env.IOT_TOPIC || '',
  iotPolicy: process.env.IOT_POLICY || '',
});

const useCase = new AttachIotPolicyUseCaseImpl({
  eventUpdateSender,
});

const adapter = new AttachIotPolicyAdapter({
  useCase,
});

export const main = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => adapter.handle(event);
