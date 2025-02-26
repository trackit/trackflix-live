import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { AttachIotPolicyUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import Ajv, { JSONSchemaType } from 'ajv';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';

const ajv = new Ajv();

const schema: JSONSchemaType<AttachIotPolicyRequest['body']> = {
  type: 'object',
  properties: {
    identityId: { type: 'string' },
  },
  required: ['identityId'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

export class AttachIotPolicyAdapter {
  private readonly useCase: AttachIotPolicyUseCase;

  public constructor({ useCase }: { useCase: AttachIotPolicyUseCase }) {
    this.useCase = useCase;
  }

  public async handle(
    event: APIGatewayProxyEventV2
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(event: APIGatewayProxyEventV2) {
    if (event.body === undefined) {
      throw new BadRequestError();
    }

    let body: undefined | AttachIotPolicyRequest['body'] = undefined;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      throw new BadRequestError();
    }
    if (!validate(body)) {
      throw new BadRequestError();
    }

    await this.useCase.attachIotPolicy(body.identityId);

    return {
      status: 'Ok',
    } satisfies AttachIotPolicyResponse['body'];
  }
}
