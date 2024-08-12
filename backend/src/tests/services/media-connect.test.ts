import {MediaConnectClient, Protocol} from "@aws-sdk/client-mediaconnect";
import {MediaConnect} from "../../services/media-connect";

const client = new MediaConnectClient({
    endpoint: 'http://localhost:5500', credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const mediaConnect = new MediaConnect(client)

beforeAll(async () => {
    await fetch("http://localhost:5500/moto-api/reset", {method: 'POST'})
})

describe('MediaConnect Service', () => {
    let flowArn = ''
    it('should create a MediaConnect flow and return the source name and id', async () => {
        const response = await mediaConnect.create("SRT", {
            Name: "SRT-Source-1",
            Protocol: Protocol.srt_caller,
            WhitelistCidr: '0.0.0.0/0',
            Description: 'MediaConnect SRT source',
            IngestPort: 5000,
        });
        flowArn = response.id;

        expect(response.name).toEqual("SRT")
        expect(flowArn).not.toBeNull()
    })

    it('should start a flow', async () => {
        const response = await mediaConnect.start(flowArn)
        expect(response).toBeTruthy();
    })

    it('should return list of sources', async () => {

        const response = await mediaConnect.list();

        expect(response).toHaveLength(1)
        expect(response[0].name).toEqual('SRT')
        expect(response[0].status).toEqual('STARTING')
    })

    it('should stop a flow', async () => {
        const response = await mediaConnect.stop(flowArn)
        const flows = await mediaConnect.list();
        expect(response).toBeTruthy();
        expect(flows[0].status).toEqual('STOPPING')
    })
})