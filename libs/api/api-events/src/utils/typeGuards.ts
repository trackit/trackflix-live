import {
  HlsSource,
  InputType,
  MediaConnectSource,
  RtmpPullSource,
  RtmpPushSource,
  RtpSource,
  Mp4Source,
  Source,
  SrtCallerSource,
  TsFileSource,
} from '@trackflix-live/types';

export function isMP4File(source: Source): source is Mp4Source {
  return source.inputType === InputType.MP4_FILE;
}

export function isHLS(source: Source): source is HlsSource {
  return source.inputType === InputType.URL_PULL;
}

export function isTSFile(source: Source): source is TsFileSource {
  return source.inputType === InputType.TS_FILE;
}

export function isRtp(source: Source): source is RtpSource {
  return source.inputType === InputType.RTP_PUSH;
}

export function isRtmpPush(source: Source): source is RtmpPushSource {
  return source.inputType === InputType.RTMP_PUSH;
}

export function isRtmpPull(source: Source): source is RtmpPullSource {
  return source.inputType === InputType.RTMP_PULL;
}

export function isMediaConnect(source: Source): source is MediaConnectSource {
  return source.inputType === InputType.MEDIACONNECT;
}

export function isSrtCaller(source: Source): source is SrtCallerSource {
  return source.inputType === InputType.SRT_CALLER;
}
