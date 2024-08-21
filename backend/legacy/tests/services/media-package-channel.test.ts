import { MediaPackageClient } from "@aws-sdk/client-mediapackage";
import { MediaPackageChannel } from "../../services/media-package-channel";

const client = new MediaPackageClient({
    endpoint: 'http://localhost:5500', credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const mediaPackageChannel = new MediaPackageChannel(client)

beforeAll(async () => {
    await fetch("http://localhost:5500/moto-api/reset", { method: 'POST' })
})

describe('MediaPackageChannel Service', () => {
    it('should create a MediaPackage channel and return the id/name', async () => {
        const response = await mediaPackageChannel.create("Channel1");

        expect(response.id).toEqual("Channel1");
        expect(response.name).toEqual("Channel1");
    })

    it('should return list of channels', async () => {
        const response = await mediaPackageChannel.list();

        expect(response).toHaveLength(1)
        expect(response[0].id).toEqual("Channel1")
        expect(response[0].name).toEqual("Channel1")
    })

    it('should delete a flow', async () => {
        await mediaPackageChannel.delete("Channel1");
        let channels = await mediaPackageChannel.list();

        expect(channels).toHaveLength(0);
    })
});
