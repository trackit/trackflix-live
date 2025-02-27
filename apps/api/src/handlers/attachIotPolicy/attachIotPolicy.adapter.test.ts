import { AttachIotPolicyAdapter } from './attachIotPolicy.adapter';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { register, reset } from 'di';
import { tokenAttachIotPolicyUseCase } from '@trackflix-live/api-events';

describe('Attach Iot Policy adapter', () => {
  it('should call use case', async () => {
    const { adapter, useCase } = setup();
    const identityId = 'be35ca18-685f-4b26-aa2b-f454d921f1cd';

    await adapter.handle({
      body: JSON.stringify({
        identityId,
      }),
    } as APIGatewayProxyEventV2);

    expect(useCase.attachIotPolicy).toHaveBeenCalledWith(identityId);
  });

  it('should return successful response', async () => {
    const { adapter } = setup();

    const response = await adapter.handle({
      body: JSON.stringify({
        identityId: '25fcc9b2-0481-4bf4-bff3-8188aa568417',
      }),
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body || '')).toEqual({
      status: 'Ok',
    });
  });

  it('should return 400 response if no body is provided', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: undefined,
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return 400 response if body is not json', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: 'invalid json',
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return 400 response if body does not match schema', async () => {
    const { adapter } = setup();
    const response = await adapter.handle({
      body: JSON.stringify({
        unknownField: 'unknownValue',
      }),
    } as APIGatewayProxyEventV2);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body || '')).toEqual({
      message: 'Bad Request',
    });
  });
});

const setup = () => {
  reset();

  const useCase = {
    attachIotPolicy: jest.fn(),
  };
  register(tokenAttachIotPolicyUseCase, { useValue: useCase });

  const adapter = new AttachIotPolicyAdapter();

  return {
    useCase,
    adapter,
  };
};
