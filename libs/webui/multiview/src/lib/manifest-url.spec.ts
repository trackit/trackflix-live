import { buildMultiviewManifestUrl } from './manifest-url';

describe('buildMultiviewManifestUrl', () => {
  const config = {
    egressDomain: 'abc123.egress.mediapackagev2.us-west-2.amazonaws.com',
    channelGroup: 'MultiView-Preview-trackflix',
    endpointName: 'cmaf-mv-endpoint',
  };

  it('routes the path through the first source channel', () => {
    const url = buildMultiviewManifestUrl(config, '3EL', [
      'soccer',
      'motorsport',
      'basketball',
    ]);

    expect(url).toContain(
      '/out/v1/MultiView-Preview-trackflix/soccer/cmaf-mv-endpoint/index.m3u8'
    );
  });

  it('encodes the aws.multiview parameter with the layout and ordered sources', () => {
    const url = buildMultiviewManifestUrl(config, '3EL', [
      'soccer',
      'motorsport',
      'basketball',
    ]);

    expect(url).toContain(
      '?aws.multiview=layout:3EL%3Bsources:soccer,motorsport,basketball'
    );
  });

  it('percent-encodes the semicolon and never emits a literal one', () => {
    const url = buildMultiviewManifestUrl(config, '2EH', [
      'soccer',
      'football',
    ]);

    expect(url).toContain('%3B');
    expect(url).not.toContain(';');
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
