import {
  CreateChannelCommand,
  CreateOriginEndpointCommand,
  MediaPackageClient,
} from '@aws-sdk/client-mediapackage';

export const main = async ({
  eventId,
}: {
  eventId: string;
}): Promise<{ eventId: string; channelId: string }> => {
  const mediaPackageClient = new MediaPackageClient();

  const channelId = `TrackflixLiveMPC-${eventId}`;
  await mediaPackageClient.send(
    new CreateChannelCommand({
      Id: channelId,
    })
  );

  await mediaPackageClient.send(
    new CreateOriginEndpointCommand({
      ChannelId: channelId,
      Id: `TrackflixLiveMPOE-HLS-${eventId}`,
      HlsPackage: {
        PlaylistType: 'EVENT',
      },
    })
  );
  await mediaPackageClient.send(
    new CreateOriginEndpointCommand({
      ChannelId: channelId,
      Id: `TrackflixLiveMPOE-DASH-${eventId}`,
      DashPackage: {},
    })
  );

  return {
    eventId,
    channelId,
  };
};
