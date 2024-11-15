import { Errors } from "../../enums/Errors";
import {EventName} from "../EventName";

describe('EventName', () => {
    it('Should be defined', () => {
        const eventName = EventName.create({ name: undefined });

        expect(eventName.isSuccess).toBe(false);
        expect(eventName.errorValue()).toBe(Errors.EVENT_NAME_MUST_BE_PROVIDED);
    });

    it('Should be at least two characters long', () => {
        const eventName = EventName.create({ name: 'a' });

        expect(eventName.isSuccess).toBe(false);
        expect(eventName.errorValue()).toBe(Errors.EVENT_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
    });

    it('Should be created successfully', () => {
        const eventName = EventName.create({ name: 'name' });
        const { name } = eventName.getValue();

        expect(eventName.isSuccess).toBe(true);
        expect(name).toBe('name');
    });
})
