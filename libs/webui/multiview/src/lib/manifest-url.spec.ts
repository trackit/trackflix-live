import {
  buildMultiviewManifestUrl,
  buildSingleViewManifestUrl,
} from './manifest-url';

const config = {
  egressDomain: 'abc123.egress.mediapackagev2.us-west-2.amazonaws.com',
  channelGroup: 'trackflix-multiview',
  multiviewChannel: 'multiview',
  endpointName: 'cmaf-mv-endpoint',
};

describe('buildSingleViewManifestUrl', () => {
  it('builds the single-feed endpoint url without the aws.multiview query', () => {
    const url = buildSingleViewManifestUrl(config, 'soccer');

    expect(url).toBe(
      'https://abc123.egress.mediapackagev2.us-west-2.amazonaws.com/out/v1/trackflix-multiview/soccer/cmaf-mv-endpoint/index.m3u8'
    );
    expect(url).not.toContain('aws.multiview');
  });

  it('returns an empty string without a channel', () => {
    expect(buildSingleViewManifestUrl(config, '')).toBe('');
  });
});

describe('buildMultiviewManifestUrl', () => {
  it('routes the path through the multiview channel, not a source channel', () => {
    const url = buildMultiviewManifestUrl(config, '3EL', [
      'soccer',
      'motorsport',
      'basketball',
    ]);

    expect(url).toContain(
      '/out/v1/trackflix-multiview/multiview/cmaf-mv-endpoint/index.m3u8?'
    );
  });

  it('url-encodes the aws.multiview value carrying the layout and ordered sources', () => {
    const url = buildMultiviewManifestUrl(config, '3EL', [
      'soccer',
      'motorsport',
      'basketball',
    ]);

    expect(url).toContain(
      '?aws.multiview=layout%3A3EL%3Bsources%3Asoccer%2Cmotorsport%2Cbasketball'
    );
  });

  it('returns an empty string for fewer than two sources', () => {
    expect(buildMultiviewManifestUrl(config, '3EL', ['soccer'])).toBe('');
  });

  it('returns an empty string for more than four sources', () => {
    expect(
      buildMultiviewManifestUrl(config, '4E', ['a', 'b', 'c', 'd', 'e'])
    ).toBe('');
  });

  it('honours a custom manifest name', () => {
    const url = buildMultiviewManifestUrl(
      { ...config, manifestName: 'master' },
      '2EH',
      ['soccer', 'football']
    );

    expect(url).toContain('/cmaf-mv-endpoint/master.m3u8?');
  });
});
