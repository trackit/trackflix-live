import { InputType } from '@aws-sdk/client-medialive';
import {
  InputNetworkLocation,
  SrtDecryptionAlgorithm,
} from '@trackflix-live/types';

export const s3SourceSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: ['MP4_FILE'],
    },
    source: { type: 'string', pattern: '^s3:\\/\\/.+\\.mp4$' },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const TsSourceSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.TS_FILE],
    },
    source: { type: 'string', pattern: '^s3:\\/\\/.+\\.ts$' },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const HlsSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.URL_PULL],
    },
    source: { type: 'string', pattern: '^https?:\\/\\/.+\\.m3u8$' },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const RtpPushSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.RTP_PUSH],
    },
    source: {
      type: 'object',
      properties: {
        inputNetworkLocation: {
          type: 'string',
          enum: [InputNetworkLocation.AWS],
        },
        inputSecurityGroups: {
          type: 'string',
          pattern: '^[0-9]+$',
        },
      },
      required: ['inputNetworkLocation', 'inputSecurityGroups'],
    },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const RtmpPushSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.RTMP_PUSH],
    },
    source: {
      type: 'object',
      properties: {
        inputNetworkLocation: {
          type: 'string',
          enum: [InputNetworkLocation.AWS],
        },
        inputSecurityGroups: {
          type: 'string',
          pattern: '^[0-9]+$',
        },
        streamName: {
          type: 'string',
        },
      },
      required: ['inputNetworkLocation', 'inputSecurityGroups'],
    },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const RtmpPullSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.RTMP_PULL],
    },
    source: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          pattern: '^rtmp:\\/\\/',
        },
        password: { type: 'string' },
        username: { type: 'string' },
      },
      required: ['url'],
    },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const MediaConnectSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.MEDIACONNECT],
    },
    source: {
      type: 'object',
      properties: {
        flowArn: {
          type: 'string',
          pattern: '^arn:aws:mediaconnect:[a-z0-9-]+:\\d{12}:flow:[^:]+:[^:]+$',
        },
        roleArn: {
          type: 'string',
          pattern: '^arn:aws:iam::\\d{12}:role/[^/]+$',
        },
      },
      required: ['flowArn', 'roleArn'],
    },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};

export const SrtCallerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.SRT_CALLER],
    },
    source: {
      type: 'object',
      properties: {
        decryption: {
          type: 'object',
          properties: {
            Algorithm: {
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
          required: ['Algorithm', 'passphraseSecretArn'],
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
      required: ['srtListenerAddress', 'srtListenerPort', 'minimumLatency'],
    },
  },
  required: [
    'name',
    'description',
    'onAirStartTime',
    'onAirEndTime',
    'inputType',
    'source',
  ],
  additionalProperties: false,
};
