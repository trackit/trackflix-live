import { LayoutId } from './types';

export interface MultiviewEndpointConfig {
  egressDomain: string;
  channelGroup: string;
  multiviewChannel: string;
  endpointName: string;
  manifestName?: string;
}

// note: MediaPackage V2 Dynamic Multiview playback contract. The URL path targets the MULTIVIEW
// channel, never a source channel. A single `aws.multiview` query parameter carries the layout and
// the ordered source channel names (`layout:LAYOUT;sources:S1,S2,...`), and its value must be
// URL-encoded. Sources fill the views in order (V1, V2, ...), V1 being the large view of 2PL/3PL/4PL.
export const buildMultiviewManifestUrl = (
  config: MultiviewEndpointConfig,
  layout: LayoutId,
  sourceChannels: readonly string[]
): string => {
  if (sourceChannels.length < 2 || sourceChannels.length > 4) {
    return '';
  }

  const manifest = config.manifestName ?? 'index';
  const base = `https://${config.egressDomain}/out/v1/${config.channelGroup}/${config.multiviewChannel}/${config.endpointName}/${manifest}.m3u8`;
  const value = `layout:${layout};sources:${sourceChannels.join(',')}`;

  return `${base}?aws.multiview=${encodeURIComponent(value)}`;
};

// Single-feed manifest of one source channel's own endpoint, used to play one source full screen
// (solo).
export const buildSingleViewManifestUrl = (
  config: MultiviewEndpointConfig,
  channel: string
): string => {
  if (!channel) {
    return '';
  }
  const manifest = config.manifestName ?? 'index';
  return `https://${config.egressDomain}/out/v1/${config.channelGroup}/${channel}/${config.endpointName}/${manifest}.m3u8`;
};
