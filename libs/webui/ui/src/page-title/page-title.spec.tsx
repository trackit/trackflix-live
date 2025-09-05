import { render } from '@testing-library/react';

import PageTitle from './page-title';
import * as allure from 'allure-js-commons';

describe('PageTitle', () => {
  it('should render successfully', async () => {
    await allure.epic('Misc');
    await allure.feature('Web interface');
    await allure.story('UI components');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const { baseElement } = render(<PageTitle title={'Test'} />);
    expect(baseElement).toBeTruthy();
  });
});
