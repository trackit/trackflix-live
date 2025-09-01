import { EventStatus } from './types';
import * as allure from 'allure-js-commons';

describe('EventStatus', () => {
  it('should have the correct values', () => {
    allure.feature('Essential features');
    allure.story('Shared typing');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    expect(EventStatus.TX).toBe('TX');
    expect(EventStatus.PRE_TX).toBe('PRE-TX');
    expect(EventStatus.POST_TX).toBe('POST-TX');
    expect(EventStatus.ENDED).toBe('ENDED');
  });
});
