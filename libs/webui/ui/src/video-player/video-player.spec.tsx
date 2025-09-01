import { render } from '@testing-library/react';

import VideoPlayer from './video-player';
import * as allure from 'allure-js-commons';

describe('VideoPlayer', () => {
  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('UI components');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

    const { baseElement } = render(<VideoPlayer />);
    expect(baseElement).toBeTruthy();
  });
});
