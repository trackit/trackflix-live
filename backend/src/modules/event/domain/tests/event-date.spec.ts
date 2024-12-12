import { Errors } from "../../enums/Errors";
import { EventDate } from "../EventDate";

describe('EventDate', () => {
    it('Should be created ', () => {
        const tomorrowDate = new Date(Date.now());
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);

        const eventDate = EventDate.create({ date: tomorrowDate });
        const { date } = eventDate.getValue();

        expect(eventDate.isSuccess).toBe(true);
        expect(date.getTime()).toBe(tomorrowDate.getTime());
    });

    it('Should be defined', () => {
        const eventDate = EventDate.create({ date: undefined });

        expect(eventDate.isSuccess).toBe(false);
        expect(eventDate.errorValue()).toBe(Errors.EVENT_DATE_SHOULD_BE_DEFINED);
    });

    it('Should not be in the past', () => {
        const yesterdayDate = new Date(Date.now());
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);

        const eventDate = EventDate.create({ date: yesterdayDate });

        expect(eventDate.isSuccess).toBe(false);
        expect(eventDate.errorValue()).toBe(Errors.EVENT_DATE_MUST_NOT_BE_IN_THE_PAST);
    });


    it('Should handle a badly formatted date', () => {
        const badlyFormattedDate = new Date("invalid-date");
        const eventDate = EventDate.create({ date: badlyFormattedDate });

        expect(eventDate.isSuccess).toBe(false);
        expect(eventDate.errorValue()).toBe(Errors.EVENT_DATE_MUST_BE_ISO_FORMATTED);
    });
})
