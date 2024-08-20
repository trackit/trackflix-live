import { MediaLiveClient } from "@aws-sdk/client-medialive";
import { MediaLiveChannel } from "../../services/media-live-channel";

const client = new MediaLiveClient({
    endpoint: 'http://localhost:5500', credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const mediaLiveChannel = new MediaLiveChannel(client)

beforeAll(async () => {
    await fetch("http://localhost:5500/moto-api/reset", {method: 'POST'});
})

describe('MediaLive Channel Service', () => {
    let channelId = ''
    it('should create a MediaConnect channel and return the source name and id', async () => {
        const response = await mediaLiveChannel.create({
            Name: 'MAIN-CHANNEL',
            InputSpecification: {
                Codec: 'AVC',
                Resolution: 'HD',
                MaximumBitrate: 'MAX_10_MBPS'
            },
            InputAttachments: [
                {
                    InputId: '0',
                    InputSettings: {
                        SourceEndBehavior: 'LOOP'
                    }
                }
            ]
        });
        channelId = response.id;

        expect(response.name).toEqual('MAIN-CHANNEL');
        expect(channelId).not.toBeNull();
    });

    it('should start a channel', async () => {
        const response = await mediaLiveChannel.start(channelId)
        expect(response).toBeTruthy();
    });

    it('should return list of channels', async () => {

        const response = await mediaLiveChannel.list();

        expect(response).toHaveLength(1)
        expect(response[0].name).toEqual('MAIN-CHANNEL');
        expect(response[0].state).toEqual('STARTING');
    });

    it('should stop a channel', async () => {
        const response = await mediaLiveChannel.stop(channelId)
        const flows = await mediaLiveChannel.list();
        expect(response).toBeTruthy();
        expect(flows[0].state).toEqual('STOPPING')
    });

    it('should delete a channel', async () => {
        const response = await mediaLiveChannel.delete(channelId);
        const flows = await mediaLiveChannel.list();

        expect(response).toBeTruthy();
        expect(flows[0].state).toBe('DELETING');
    });
})
