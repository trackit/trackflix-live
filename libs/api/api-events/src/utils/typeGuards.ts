import {
  Hls,
  MediaConnect,
  RtmpPull,
  RtmpPush,
  Rtp,
  S3Source,
  SrtCaller,
  TsFile,
} from '@trackflix-live/types';
import { InputType } from '@aws-sdk/client-medialive';

export function isMP4File(source: unknown): source is S3Source {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.MP4_FILE
  );
}

export function isHLS(source: unknown): source is Hls {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.URL_PULL
  );
}

export function isTSFile(source: unknown): source is TsFile {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.TS_FILE
  );
}

export function isRtp(source: unknown): source is Rtp {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.RTP_PUSH
  );
}

export function isRtmpPush(source: unknown): source is RtmpPush {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.RTMP_PUSH
  );
}

export function isRtmpPull(source: unknown): source is RtmpPull {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.RTMP_PULL
  );
}

export function isMediaConnect(source: unknown): source is MediaConnect {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.MEDIACONNECT
  );
}

export function isSrtCaller(source: unknown): source is SrtCaller {
  return (
    typeof source === 'object' &&
    source !== null &&
    'inputType' in source &&
    source.inputType === InputType.SRT_CALLER
  );
}
