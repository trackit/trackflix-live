import { render } from '@testing-library/react';

import PageTitle from './page-title';
import * as allure from 'allure-js-commons';

describe('PageTitle', () => {
  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { baseElement } = render(<PageTitle title={'Test'} />);
    expect(baseElement).toBeTruthy();
  });
});
