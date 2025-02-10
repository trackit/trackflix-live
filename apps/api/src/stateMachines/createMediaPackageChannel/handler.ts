import {
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from '@aws-sdk/client-mediapackage';

export const main = async ({
  eventId,
}: {
  eventId: string;
}): Promise<{ eventId: string; mediaPackageChannelId: string }> => {
  const mediaPackageClient = new MediaPackageClient();

  const mediaPackageChannelId = `TrackflixLiveMPC-${eventId}`;
  await mediaPackageClient.send(
    new CreateChannelCommand({
      Id: mediaPackageChannelId,
    })
  );

  await mediaPackageClient.send(
    new CreateOriginEndpointCommand({
      ChannelId: mediaPackageChannelId,
      Id: `TrackflixLiveMPOE-HLS-${eventId}`,
      HlsPackage: {
        PlaylistType: 'EVENT',
      },
    })
  );
  await mediaPackageClient.send(
    new CreateOriginEndpointCommand({
      ChannelId: mediaPackageChannelId,
      Id: `TrackflixLiveMPOE-DASH-${eventId}`,
      DashPackage: {},
    })
  );

  return {
    eventId,
    mediaPackageChannelId,
  };
};
