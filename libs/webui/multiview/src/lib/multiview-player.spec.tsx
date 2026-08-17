import { render } from '@testing-library/react';
import { MultiviewPlayer } from './multiview-player';

const construct = vi.fn();
const attachMedia = vi.fn();
const loadSource = vi.fn();
const stopLoad = vi.fn();
const startLoad = vi.fn();
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
    startLoad = startLoad;
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

  it('recreates a fresh hls instance and loads the new source on switch', () => {
    const { rerender } = render(<MultiviewPlayer src="https://host/a.m3u8" />);

    expect(construct).toHaveBeenCalledTimes(1);
    expect(loadSource).toHaveBeenLastCalledWith('https://host/a.m3u8');

    rerender(<MultiviewPlayer src="https://host/b.m3u8" />);

    // The previous instance is torn down and a fresh one loads the new source. This is what makes a
    // multiview -> single-feed (solo) switch reliable.
    expect(destroy).toHaveBeenCalled();
    expect(construct).toHaveBeenCalledTimes(2);
    expect(loadSource).toHaveBeenLastCalledWith('https://host/b.m3u8');
  });

  it('tears down and creates no instance when the source is cleared', () => {
    const { rerender } = render(<MultiviewPlayer src="https://host/a.m3u8" />);
    const created = construct.mock.calls.length;

    rerender(<MultiviewPlayer src="" />);

    expect(destroy).toHaveBeenCalled();
    expect(construct.mock.calls.length).toBe(created);
  });
});
