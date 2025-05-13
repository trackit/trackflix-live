import {
  Hls,
  InputType,
  MediaConnect,
  RtmpPull,
  RtmpPush,
  Rtp,
  S3Source,
  SrtCaller,
  SrtDecryptionAlgorithm,
  TsFile,
} from '@trackflix-live/types';
import { JSONSchemaType } from 'ajv';

export const s3SourceSchema: JSONSchemaType<S3Source> = {
  type: 'object',
  properties: {
    value: { type: 'string', pattern: '^s3:\\/\\/.+\\.mp4$' },
    inputType: { type: 'string', const: InputType.MP4_FILE },
  },
  required: ['inputType', 'value'],
  additionalProperties: false,
};

export const TsSourceSchema: JSONSchemaType<TsFile> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.TS_FILE,
    },
    value: { type: 'string', pattern: '^s3:\\/\\/.+\\.ts$' },
  },
  required: ['inputType', 'value'],
  additionalProperties: false,
};

export const HlsSchema: JSONSchemaType<Hls> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.URL_PULL,
    },
    value: { type: 'string', pattern: '^https?:\\/\\/.+\\.m3u8$' },
  },
  required: ['inputType', 'value'],
  additionalProperties: false,
};

export const RtpPushSchema: JSONSchemaType<Rtp> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.RTP_PUSH,
    },
    inputSecurityGroups: {
      type: 'string',
      pattern: '^[0-9]+$',
    },
  },
  required: ['inputType', 'inputSecurityGroups'],
  additionalProperties: false,
};

export const RtmpPushSchema: JSONSchemaType<RtmpPush> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.RTMP_PUSH,
    },
    inputSecurityGroups: {
      type: 'string',
      pattern: '^[0-9]+$',
    },
    streamName: {
      type: 'string',
    },
  },
  required: ['inputType', 'inputSecurityGroups'],
  additionalProperties: false,
};

export const RtmpPullSchema: JSONSchemaType<RtmpPull> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.RTMP_PULL,
    },
    url: {
      type: 'string',
      pattern: '^rtmp:\\/\\/',
    },
    password: { type: 'string', nullable: true },
    username: { type: 'string', nullable: true },
  },
  required: ['inputType', 'url'],
  additionalProperties: false,
};

export const MediaConnectSchema: JSONSchemaType<MediaConnect> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.MEDIACONNECT,
    },
    flowArn: {
      type: 'string',
      pattern: '^arn:aws:mediaconnect:[a-z0-9-]+:\\d{12}:flow:[^:]+:[^:]+$',
    },
    roleArn: {
      type: 'string',
      pattern: '^arn:aws:iam::\\d{12}:role/[^/]+$',
    },
  },
  required: ['inputType', 'flowArn', 'roleArn'],
  additionalProperties: false,
};

export const SrtCallerSchema: JSONSchemaType<SrtCaller> = {
  type: 'object',
  properties: {
    inputType: {
      type: 'string',
      const: InputType.SRT_CALLER,
    },
    decryption: {
      type: 'object',
      nullable: true,
      properties: {
        algorithm: {
          type: 'string',
          enum: [
            SrtDecryptionAlgorithm.AES_128,
            SrtDecryptionAlgorithm.AES_192,
            SrtDecryptionAlgorithm.AES_256,
          ],
        },
        passphraseSecretArn: {
          type: 'string',
        },
      },
      required: ['algorithm', 'passphraseSecretArn'],
    },
    srtListenerAddress: {
      type: 'string',
    },
    srtListenerPort: {
      type: 'string',
    },
    streamId: {
      type: 'string',
    },
    minimumLatency: {
      type: 'number',
      minimum: 0,
    },
  },
  required: [
    'inputType',
    'srtListenerAddress',
    'srtListenerPort',
    'minimumLatency',
  ],
  additionalProperties: false,
};
