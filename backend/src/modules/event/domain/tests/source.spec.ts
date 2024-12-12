import { Errors } from "../../enums/Errors";
import { SourceProtocol } from "../../enums/SourceProtocol";
import { Source } from "../Source";
import { SourceName } from "../SourceName";


describe('Source', () => {
    const sourceName = SourceName.create({ name: 'source' }).getValue();

    it('Should be able to be created', () => {
        const source = Source.create({
            name: sourceName,
            protocol: SourceProtocol["SRT_CALLER"],
        });

        const { name, protocol } = source.getValue();

        expect(source.isSuccess).toBe(true);
        expect(name.name).toBe('source');
        expect(protocol).toBe(SourceProtocol["SRT_CALLER"]);
    });

    it('Should be provided a valid protocol', () => {
        const source = Source.create({
            name: sourceName,
            protocol: 'Invalid protocol' as SourceProtocol,
        });

        expect(source.isSuccess).toBe(false);
        expect(source.errorValue()).toBe(Errors.SOURCE_INVALID_PROTOCOL);
    });

    it('Should be provided a protocol value', () => {
        const source = Source.create({
            name: sourceName,
            protocol: undefined,
        });

        expect(source.isSuccess).toBe(false);
        expect(source.errorValue()).toBe(Errors.SOURCE_VALUES_MUST_BE_DEFINED);
    });

    it('Should be provided a sourceName', () => {
        const source = Source.create({
            name: undefined,
            protocol: SourceProtocol["SRT_CALLER"],
        });

        expect(source.isSuccess).toBe(false);
        expect(source.errorValue()).toBe(Errors.SOURCE_VALUES_MUST_BE_DEFINED);
    });
})
