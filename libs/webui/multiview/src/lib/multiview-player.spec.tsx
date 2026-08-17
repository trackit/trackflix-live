import { render } from '@testing-library/react';
import { MultiviewPlayer } from './multiview-player';

const construct = vi.fn();
const attachMedia = vi.fn();
const loadSource = vi.fn();
const stopLoad = vi.fn();
const destroy = vi.fn();

vi.mock('hls.js', () => {
  class FakeHls {
    static isSupported() {
      return true;
    }
    static Events = { ERROR: 'hlsError' };
    static ErrorTypes = {
      MEDIA_ERROR: 'mediaError',
      NETWORK_ERROR: 'networkError',
    };
    attachMedia = attachMedia;
    loadSource = loadSource;
    stopLoad = stopLoad;
    destroy = destroy;
    on = vi.fn();
    constructor(config: unknown) {
      construct(config);
    }
  }
  return { default: FakeHls };
});

describe('MultiviewPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a single hls instance and swaps the source without tearing it down', () => {
    const { rerender } = render(<MultiviewPlayer src="https://host/a.m3u8" />);

    expect(construct).toHaveBeenCalledTimes(1);
    expect(attachMedia).toHaveBeenCalledTimes(1);
    expect(loadSource).toHaveBeenLastCalledWith('https://host/a.m3u8');

    rerender(<MultiviewPlayer src="https://host/b.m3u8" />);

    expect(construct).toHaveBeenCalledTimes(1);
    expect(attachMedia).toHaveBeenCalledTimes(1);
    expect(destroy).not.toHaveBeenCalled();
    expect(loadSource).toHaveBeenLastCalledWith('https://host/b.m3u8');
  });

  it('stops loading when the source is cleared', () => {
    const { rerender } = render(<MultiviewPlayer src="https://host/a.m3u8" />);

    rerender(<MultiviewPlayer src="" />);

    expect(stopLoad).toHaveBeenCalled();
  });
});
