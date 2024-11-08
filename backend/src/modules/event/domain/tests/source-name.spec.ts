import { Errors } from "../../enums/Errors";
import { SourceName } from "../SourceName";

describe('SourceName', () => {
    it('Should be defined', () => {
        const sourceName = SourceName.create({ name: undefined });

        expect(sourceName.isSuccess).toBe(false);
        expect(sourceName.errorValue()).toBe(Errors.SOURCE_NAME_MUST_BE_PROVIDED);
    });

    it('Should have a name length of two characters or more', () => {
        const sourceName = SourceName.create({ name: 'n' });

        expect(sourceName.isSuccess).toBe(false);
        expect(sourceName.errorValue()).toBe(Errors.SOURCE_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
    });
})
