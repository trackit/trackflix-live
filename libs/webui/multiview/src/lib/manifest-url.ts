import { LayoutId } from './types';

export interface MultiviewEndpointConfig {
  egressDomain: string;
  channelGroup: string;
  endpointName: string;
  manifestName?: string;
}

// Real MediaPackage V2 Dynamic MultiView manifest contract (from the AWS private beta onboarding
// guide). A single `aws.multiview` query parameter carries the layout and the ordered source
// channel names: `aws.multiview=layout:LAYOUT;sources:S1,S2,...`. Two constraints from the guide:
//   - the `;` MUST be percent-encoded as %3B (a literal `;` is dropped as a query separator, 400),
//   - the channel in the URL path MUST be the first listed source (the primary tile for 2PL/3PL/4PL).
// Sources are MediaPackage channel names, in tile order (V1, V2, ...). Between 2 and 4 views.
export const buildMultiviewManifestUrl = (
  config: MultiviewEndpointConfig,
  layout: LayoutId,
  sourceChannels: readonly string[]
): string => {
  if (sourceChannels.length < 2 || sourceChannels.length > 4) {
    return '';
  }

  const manifest = config.manifestName ?? 'index';
  const pathChannel = sourceChannels[0];
  const base = `https://${config.egressDomain}/out/v1/${config.channelGroup}/${pathChannel}/${config.endpointName}/${manifest}.m3u8`;
  const value = `layout:${layout};sources:${sourceChannels.join(',')}`;

  return `${base}?aws.multiview=${value.replace(/;/g, '%3B')}`;
};

// Single-feed manifest for one channel: the same endpoint URL without the aws.multiview query, used
// to play one source full screen (solo).
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
