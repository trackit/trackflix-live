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
    source: { type: 'string' },
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
    source: { type: 'string' },
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
          enum: [InputNetworkLocation.AWS, InputNetworkLocation.ON_PREMISES],
        },
        inputSecurityGroups: {
          type: 'string',
        },
      },
      required: ['inputNetworkLocation'],
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
          enum: [InputNetworkLocation.AWS, InputNetworkLocation.ON_PREMISES],
        },
        inputSecurityGroups: {
          type: 'string',
        },
        vpcSettings: {
          type: 'object',
          properties: {
            subnetIds: {
              type: 'string',
            },
            securityGroupId: {
              type: 'string',
            },
          },
          required: ['subnetIds', 'securityGroupId'],
        },
        streamName: {
          type: 'string',
        },
      },
      required: ['inputNetworkLocation', 'streamName'],
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
        inputNetworkLocation: {
          type: 'string',
          enum: [InputNetworkLocation.AWS, InputNetworkLocation.ON_PREMISES],
        },
        inputSecurityGroups: {
          type: 'string',
        },
        streamName: {
          type: 'string',
        },
        roleArn: {
          type: 'string',
        },
        url: {
          type: 'string',
          format: 'uri',
        },
      },
      required: ['inputNetworkLocation', 'streamName', 'roleArn', 'url'],
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

export const MulticastSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.MULTICAST],
    },
    source: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        sourceIp: { type: 'string' },
      },
      required: ['url', 'sourceIp'],
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
        flowArn: { type: 'string' },
        roleArn: { type: 'string' },
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

export const CdiSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    onAirStartTime: { type: 'string', format: 'date-time' },
    onAirEndTime: { type: 'string', format: 'date-time' },
    inputType: {
      type: 'string',
      enum: [InputType.AWS_CDI],
    },
    source: {
      type: 'object',
      properties: {
        vpcSettings: {
          type: 'object',
          properties: {
            subnetIds: {
              type: 'string',
            },
            securityGroupId: {
              type: 'string',
            },
          },
          required: ['subnetIds', 'securityGroupId'],
        },
        roleArn: { type: 'string' },
      },
      required: ['vpcSettings', 'roleArn'],
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
      required: [
        'srtListenerAddress',
        'srtListenerPort',
        'streamId',
        'minimumLatency',
      ],
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
