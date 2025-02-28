import { render } from '@testing-library/react';

import VideoPlayer from './video-player';

describe('VideoPlayer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VideoPlayer />);
    expect(baseElement).toBeTruthy();
  });
});
