import { Errors } from "../../enums/Errors";
import { SourceProtocol } from "../../enums/SourceProtocol";
import { Source } from "../Source";
import { SourceName } from "../SourceName";

let source: Source;

describe('Source', () => {
  beforeEach (() => {
    source = null;
  })

  it ('Should be able to be created', () => {
    source = Source.create({
      name: SourceName.create({ name: 'source' }),
      protocol: SourceProtocol["SRT_CALLER"]
    });

    expect(source.name.name).toEqual('source');
    expect(source.protocol).toEqual(SourceProtocol["SRT_CALLER"]);
  })

  it("Source must throw if sourceName not provided", () => {
    const t = () => {
      source = Source.create({
        name: SourceName.create({ name: '' }),
        protocol: SourceProtocol["SRT_CALLER"]
      });
    };
    expect(t).toThrow(Errors.SOURCE_NAME_MUST_BE_PROVIDED);
  });

  it("Source must throw if sourceName length < 2", () => {
    const t = () => {
      source = Source.create({
        name: SourceName.create({ name: 'n' }),
        protocol: SourceProtocol["SRT_CALLER"]
      });
    };
    expect(t).toThrow(Errors.SOURCE_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG);
  });
})
