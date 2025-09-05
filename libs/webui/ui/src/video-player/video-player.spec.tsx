import { render } from '@testing-library/react';

import VideoPlayer from './video-player';
import * as allure from 'allure-js-commons';

describe('VideoPlayer', () => {
  it('should render successfully', async () => {
    await allure.epic('Misc');
    await allure.feature('Web interface');
    await allure.story('UI components');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const { baseElement } = render(<VideoPlayer src={'test_source'} />);
    expect(baseElement).toBeTruthy();
  });
});
