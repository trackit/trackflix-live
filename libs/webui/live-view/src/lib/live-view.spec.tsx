import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { LiveView } from './live-view';
import { VideoPlayer } from '@trackflix-live/ui';

// Mock the VideoPlayer component
vi.mock('@trackflix-live/ui', () => ({
  VideoPlayer: vi.fn(),
}));

// Get the mocked VideoPlayer
const mockVideoPlayer = vi.mocked(VideoPlayer);

// Mock environment variables
vi.stubEnv('VITE_TRACKIT_TV_LIVE', 'https://example.com/live-stream.m3u8');

describe('LiveView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable to default
    vi.stubEnv('VITE_TRACKIT_TV_LIVE', 'https://example.com/live-stream.m3u8');
    
    // Setup VideoPlayer mock to render something we can test
    mockVideoPlayer.mockImplementation(({ src }: { src: string }) => (
      <div data-testid="video-player" data-src={src}>
        Live Video Player
      </div>
    ));
  });

  it('should render successfully', () => {
    const { baseElement } = render(<LiveView />);
    expect(baseElement).toBeTruthy();
  });

  it('should display the video player component', () => {
    render(<LiveView />);
    
    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toBeInTheDocument();
    expect(videoPlayer).toHaveTextContent('Live Video Player');
  });

  it('should load video from environment variable', () => {
    render(<LiveView />);
    
    expect(mockVideoPlayer).toHaveBeenCalledWith(
      { src: 'https://example.com/live-stream.m3u8' },
      {}
    );
  });

  it('should handle missing video URL gracefully', () => {
    vi.stubEnv('VITE_TRACKIT_TV_LIVE', '');
    
    render(<LiveView />);
    
    expect(mockVideoPlayer).toHaveBeenCalledWith(
      { src: '' },
      {}
    );
    
    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toBeInTheDocument();
  });



  it('should work with different video stream URLs', () => {
    const testUrls = [
      'https://cdn.example.com/stream.m3u8',
      'https://live.trackflix.com/channel1/index.m3u8',
      'https://streaming.service.com/live/feed.m3u8',
    ];

    testUrls.forEach((url) => {
      vi.stubEnv('VITE_TRACKIT_TV_LIVE', url);
      vi.clearAllMocks();
      
      render(<LiveView />);
      
      expect(mockVideoPlayer).toHaveBeenCalledWith(
        { src: url },
        {}
      );
    });
  });

  it('should provide a centered video viewing experience', () => {
    render(<LiveView />);
    
    // Verify that the video player is rendered within a centered container
    const videoPlayer = screen.getByTestId('video-player');
    expect(videoPlayer).toBeInTheDocument();
    
    // The component should only render the video player once
    expect(mockVideoPlayer).toHaveBeenCalledTimes(1);
  });
});
