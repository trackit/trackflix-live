import { DeleteEventUseCase } from "./deleteEventUseCase";
import { FakeEventRepository } from "../../repositories/tests/fakeEventRepository";
import '../../index';

let useCase: DeleteEventUseCase;
let fakeEventRepo: FakeEventRepository = new FakeEventRepository();

const startTime = new Date(Date.now());
startTime.setDate(startTime.getDate() + 1);

const endTime = new Date(Date.now());
endTime.setDate(endTime.getDate() + 2);

describe('CreateEventUseCase', () => {
    beforeEach(() => {
        useCase = new DeleteEventUseCase(
            fakeEventRepo,
        );
    })

    it('Should create an event', async () => {
        const event = await useCase.execute({
            name: 'Event',
            description: 'Description',
            onAirStartTime: startTime,
            onAirEndTime: endTime,
            status: 'TX',
            source: {
                name: 'name',
                protocol: 'HLS',
            },
        });

        expect(event.isSuccess).toBe(true);
        expect(event.getValue()).not.toBeNull();
    });

    it('Should return a failed result if an error is thrown', async () => {
        jest
            .spyOn(fakeEventRepo, 'deleteEventById')
            .mockImplementation(() => {
                    throw new Error("An error occurred.")
                }
            );

        const event = await useCase.execute({
            name: 'Event',
            description: 'Description',
            onAirStartTime: startTime,
            onAirEndTime: endTime,
            status: 'TX',
            source: {
                name: 'name',
                protocol: 'HLS',
            },
        });

        expect(event.isSuccess).toBe(false);
        expect(event.errorValue()).toBe("An error occurred.");
    });
})
