import { EventStatus } from './types';
import * as allure from 'allure-js-commons';

describe('EventStatus', () => {
  it('should have the correct values', async () => {
    await allure.epic('Misc');
    await allure.feature('Essential features');
    await allure.story('Shared typing');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    expect(EventStatus.TX).toBe('TX');
    expect(EventStatus.PRE_TX).toBe('PRE-TX');
    expect(EventStatus.POST_TX).toBe('POST-TX');
    expect(EventStatus.ENDED).toBe('ENDED');
  });
});
