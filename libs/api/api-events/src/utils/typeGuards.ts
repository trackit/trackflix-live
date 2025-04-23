import {
  Cdi,
  MediaConnect,
  RtmpPull,
  RtmpPush,
  Rtp,
  SrtCaller,
} from '@trackflix-live/types';
import { InputType } from '@aws-sdk/client-medialive';

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRtp(source: unknown, type: InputType): source is Rtp {
  return type === InputType.RTP_PUSH && typeof source === 'object';
}

export function isRtmpPush(source: unknown, type: string): source is RtmpPush {
  return type === InputType.RTMP_PUSH && typeof source === 'object';
}

export function isRtmpPull(source: unknown, type: string): source is RtmpPull {
  return type === InputType.RTMP_PULL && typeof source === 'object';
}

export function isMediaConnect(
  source: unknown,
  type: string
): source is MediaConnect {
  return type === InputType.MEDIACONNECT && typeof source === 'object';
}

export function isCdi(source: unknown, type: string): source is Cdi {
  return type === InputType.AWS_CDI && typeof source === 'object';
}

export function isSrtCaller(
  source: unknown,
  type: string
): source is SrtCaller {
  return type === InputType.SRT_CALLER && typeof source === 'object';
}
