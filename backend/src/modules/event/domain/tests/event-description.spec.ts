import { Errors } from "../../enums/Errors";
import {EventDescription} from "../EventDescription";

describe('EventDescription', () => {
    it('Should be defined', () => {
        const eventDescription = EventDescription.create({ description: undefined });

        expect(eventDescription.isSuccess).toBe(false);
        expect(eventDescription.errorValue()).toBe(Errors.EVENT_DESCRIPTION_MUST_BE_PROVIDED);
    });

    it('Should be created successfully', () => {
        const eventDescription = EventDescription.create({ description: 'description' });
        const { description } = eventDescription.getValue();

        expect(eventDescription.isSuccess).toBe(true);
        expect(description).toBe('description');
    });
})
