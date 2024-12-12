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

    it('Should be created successfully', () => {
        const sourceName = SourceName.create({ name: 'source-name' });
        const { name } = sourceName.getValue();

        expect(sourceName.isSuccess).toBe(true);
        expect(name).toBe('source-name');
    });
})
