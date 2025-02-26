import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import CopyText from './copy-text';
import '@testing-library/jest-dom';

describe('CopyText', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('renders text content', () => {
    render(<CopyText text="Test content" />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('shows copy button by default', () => {
    render(<CopyText text="Test content" />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('changes button text and icon when clicked', async () => {
    render(<CopyText text="Test content" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test content');
  });
});
