import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import Clock from './clock';

describe('Clock', () => {
  beforeEach(() => {
    // Mock the Date object to have a consistent time for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Clock />);
    expect(baseElement).toBeTruthy();
  });

  it('should display the current time in correct format', () => {
    render(<Clock />);
    expect(screen.getByText('12:00:00 PM')).toBeInTheDocument();
  });


  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { unmount } = render(<Clock />);
    
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
