import { render } from '@testing-library/react';

import StatusBadge from './status-badge';
import * as allure from 'allure-js-commons';

describe('StatusBadge', () => {
  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { baseElement } = render(<StatusBadge status="PRE-TX" />);
    expect(baseElement).toBeTruthy();
  });
});
