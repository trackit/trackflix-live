import {
  Hls,
  InputType,
  MediaConnect,
  RtmpPull,
  RtmpPush,
  Rtp,
  S3Source,
  Source,
  SrtCaller,
  TsFile,
} from '@trackflix-live/types';

export function isMP4File(source: Source): source is S3Source {
  return source.inputType === InputType.MP4_FILE;
}

export function isHLS(source: Source): source is Hls {
  return source.inputType === InputType.URL_PULL;
}

export function isTSFile(source: Source): source is TsFile {
  return source.inputType === InputType.TS_FILE;
}

export function isRtp(source: Source): source is Rtp {
  return source.inputType === InputType.RTP_PUSH;
}

export function isRtmpPush(source: Source): source is RtmpPush {
  return source.inputType === InputType.RTMP_PUSH;
}

export function isRtmpPull(source: Source): source is RtmpPull {
  return source.inputType === InputType.RTMP_PULL;
}

export function isMediaConnect(source: Source): source is MediaConnect {
  return source.inputType === InputType.MEDIACONNECT;
}

export function isSrtCaller(source: Source): source is SrtCaller {
  return source.inputType === InputType.SRT_CALLER;
}
