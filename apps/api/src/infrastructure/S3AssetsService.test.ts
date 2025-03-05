import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { S3AssetsService } from './S3AssetsService';

describe('S3AssetsService', () => {
  const mock = mockClient(S3Client);

  beforeEach(() => {
    mock.reset();
  });

  it('should return true if asset exists', async () => {
    const { s3AssetsService } = setup();

    mock.resolvesOnce({
      $metadata: {
        httpStatusCode: 200,
      },
    });

    expect(await s3AssetsService.assetExists('s3://bucket/key')).toEqual(true);
  });

  it('should return false if asset does not exist', async () => {
    const { s3AssetsService } = setup();

    mock.rejectsOnce(
      new S3ServiceException({
        name: 'NotFound',
        $fault: 'client',
        $metadata: {
          httpStatusCode: 404,
          requestId: 'S1XEK2PNA57TTE1J',
          extendedRequestId:
            'Y1grudFPThks9ytUeqQCox07EmuypJZzim/DMnMy8ZwRmFHLuTbs+jXq0+12sCh90qrrBVlUzFeYL2zBVfsXOQ==',
          attempts: 2,
          totalRetryDelay: 23,
        },
        message: 'UnknownError',
      })
    );

    expect(await s3AssetsService.assetExists('s3://bucket/key')).toEqual(false);
  });
});

const setup = () => {
  const client = new S3Client({
    credentials: {
      accessKeyId: 'fakeAccessKeyId',
      secretAccessKey: 'fakeSecretAccessKey',
    },
  });
  const s3AssetsService = new S3AssetsService(client);

  return { client, s3AssetsService };
};
