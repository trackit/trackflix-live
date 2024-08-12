import {InputState, InputType, MediaLiveClient} from "@aws-sdk/client-medialive";
import {MediaLiveInput} from "../../services/media-live-input";
import { Input } from "../../interfaces/input-controller.interface";

const client = new MediaLiveClient({
    endpoint: 'http://localhost:5500', credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const mediaLiveInput = new MediaLiveInput(client)

beforeAll(async () => {
    await fetch("http://localhost:5500/moto-api/reset", {method: 'POST'});
})

describe('MediaLive Input Service', () => {
    let inputId = ''
    it('should create a MediaConnect input and return the source name and id', async () => {
        const response = await mediaLiveInput.create({
            Name: 'SRT-INPUT',
            Type: InputType.SRT_CALLER,
        });
        inputId = response.id;

        expect(response.name).toEqual('SRT-INPUT');
        expect(inputId).not.toBeNull();
    })

    it('should return list of inputs', async () => {

        const response = await mediaLiveInput.list();

        expect(response).toHaveLength(1);
        expect(response[0].name).toEqual('SRT-INPUT');
        expect(response[0].type).toEqual('SRT_CALLER');
    })

    it('should delete an input', async () => {
        const response = await mediaLiveInput.delete(inputId);
        let inputs = await mediaLiveInput.list();


        expect(response).toBeTruthy();
        expect(inputs[0].state).toEqual(InputState.DELETING);
    })
})
