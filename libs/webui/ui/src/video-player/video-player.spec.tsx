import { render } from '@testing-library/react';

import VideoPlayer from './video-player';

describe('VideoPlayer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VideoPlayer src="" />);
    expect(baseElement).toBeTruthy();
  });

  it('should constrain video width when vertical is true', () => {
    const { container } = render(<VideoPlayer src="" vertical={true} />);
    const video = container.querySelector('video');
    expect(video?.className).toContain('max-w-[300px]');
  });

  it('should use full width when vertical is false', () => {
    const { container } = render(<VideoPlayer src="" vertical={false} />);
    const video = container.querySelector('video');
    expect(video?.className).toContain('w-full');
    expect(video?.className).not.toContain('max-w-[300px]');
  });
});
