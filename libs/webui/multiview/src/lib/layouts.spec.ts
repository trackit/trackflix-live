import { primaryLayoutFor } from './layouts';

describe('primaryLayoutFor', () => {
  it('returns the primary-view layout for each tile count', () => {
    expect(primaryLayoutFor(2)).toBe('2PL');
    expect(primaryLayoutFor(3)).toBe('3PL');
    expect(primaryLayoutFor(4)).toBe('4PL');
  });

  it('falls back to the default layout for unsupported counts', () => {
    expect(primaryLayoutFor(1)).toBe('3PL');
  });
});
