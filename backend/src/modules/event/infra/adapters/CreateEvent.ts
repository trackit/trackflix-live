import { createEventUseCase } from "../../useCases/createEvent";

import { CreateEventUseCase } from "../../useCases/createEvent/createEventUseCase";
import { FakeEventRepository } from "../../repositories/tests/fakeEventRepository";
import { eventRepository } from "../../repositories";

import '../../index';

export const handler = async (event: any, context: any) => {
    console.log('Incoming event:', JSON.stringify(event));

    const { body } = event;

    const response = await createEventUseCase.execute(body);

    if (!response.isSuccess)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "Created" })
    }
}
