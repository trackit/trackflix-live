import { tokenAttachIotPolicyUseCase } from '@trackflix-live/api-events';
import { BadRequestError, handleHttpRequest } from '../HttpErrors';
import Ajv, { JSONSchemaType } from 'ajv';
import {
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda/trigger/api-gateway-proxy';
import {
  AttachIotPolicyRequest,
  AttachIotPolicyResponse,
} from '@trackflix-live/types';
import { inject } from '@trackflix-live/di';
import { CustomRequestContext } from '../types';

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
  private readonly useCase = inject(tokenAttachIotPolicyUseCase);

  public async handle(
    event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
  ): Promise<APIGatewayProxyStructuredResultV2> {
    return handleHttpRequest({
      event,
      func: this.processRequest.bind(this),
    });
  }

  public async processRequest(
    event: APIGatewayProxyEventV2WithRequestContext<CustomRequestContext>
  ) {
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
