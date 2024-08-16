import { MediaPackageClient } from "@aws-sdk/client-mediapackage";
import { MediaPackageEndpoint } from "../../services/media-package-endpoint"
import { MediaPackageChannel } from "../../services/media-package-channel"

const client = new MediaPackageClient({
    endpoint: 'http://localhost:5500', credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const mediaPackageChannel = new MediaPackageChannel(client)
const mediaPackageEndpoint = new MediaPackageEndpoint(client)

let channelId = "";


beforeAll(async () => {
    await fetch("http://localhost:5500/moto-api/reset", { method: 'POST' });
    channelId = (await mediaPackageChannel.create("Channel1")).id;
})

describe('MediaPackageEndpoint Service', () => {
    it('should create a MediaPackage endpoint and return the id/name', async () => {
        const response = await mediaPackageEndpoint.create({
            Id: "Endpoint1",
            ChannelId: "Channel1",
        });

        expect(response.id).toEqual("Endpoint1");
        expect(response.name).toEqual("Endpoint1");
        expect(response.channelId).toEqual("Channel1");
    })

    it('should return list of endpoints', async () => {
        const response = await mediaPackageEndpoint.list();

        expect(response).toHaveLength(1)
        expect(response[0].id).toEqual("Endpoint1")
        expect(response[0].name).toEqual("Endpoint1")
        expect(response[0].channelId).toEqual("Channel1");
    })

    it('should delete a flow', async () => {
        await mediaPackageEndpoint.delete("Endpoint1");
        let endpoints = await mediaPackageEndpoint.list();

        expect(endpoints).toHaveLength(0);
    })
});
