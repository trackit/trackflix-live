import { EventStatus } from './types';

describe('EventStatus', () => {
  it('should have the correct values', () => {
    expect(EventStatus.TX).toBe('TX');
    expect(EventStatus.PRE_TX).toBe('PRE-TX');
    expect(EventStatus.POST_TX).toBe('POST-TX');
    expect(EventStatus.CONFIRMED).toBe('CONFIRMED');
    expect(EventStatus.ENDED).toBe('ENDED');
  });

});
