import { render } from '@testing-library/react';

import StatusBadge from './status-badge';
import * as allure from 'allure-js-commons';
import { EventStatus } from '@trackflix-live/types';

describe('StatusBadge', () => {
  it('should render successfully', async () => {
    await allure.epic('Misc');
    await allure.feature('Web interface');
    await allure.story('UI components');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const { baseElement } = render(<StatusBadge status={EventStatus.PRE_TX} />);
    expect(baseElement).toBeTruthy();
  });
});
