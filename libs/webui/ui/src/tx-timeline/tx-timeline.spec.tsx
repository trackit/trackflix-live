import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateTime } from 'luxon';
import TxTimeline from './tx-timeline';

describe('TxTimeline', () => {
  beforeEach(() => {
    // Mock DateTime.now() to return a fixed date
    vi.spyOn(DateTime, 'now').mockImplementation(() => 
      DateTime.fromISO('2024-03-15T12:00:00.000Z') as DateTime<true>
    );
  });

  it('should render all steps with their titles', () => {
    const steps = [
      { title: 'Start', datetime: '2024-03-15T11:55:00.000Z' },
      { title: 'Processing', datetime: '2024-03-15T12:00:00.000Z' },
      { title: 'Complete', datetime: '2024-03-15T12:05:00.000Z' }
    ];

    render(<TxTimeline steps={steps} />);

    steps.forEach(step => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });

  it('should format dates correctly', () => {
    const steps = [
      { title: 'Start', datetime: '2024-03-15T11:55:00.000Z' }
    ];

    render(<TxTimeline steps={steps} />);

    // Match any time in format "hh:mm:ss am|pm" and any date in format "MM/dd/yyyy"
    const timeRegex = /\d{2}:\d{2}:\d{2}\s[AP]M/i;
    const dateRegex = /\d{2}\/\d{2}\/\d{4}/;

    expect(screen.getByText(timeRegex)).toBeInTheDocument();
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });

  it('should show -- for steps without datetime', () => {
    const steps = [
      { title: 'Start', datetime: '2024-03-15T11:55:00.000Z' },
      { title: 'Processing' },
      { title: 'Complete' }
    ];

    render(<TxTimeline steps={steps} />);

    // Should find multiple instances of '--' for steps without datetime
    const placeholders = screen.getAllByText('--');
    expect(placeholders).toHaveLength(2);
  });

  it('should handle invalid dates', () => {
    const steps = [
      { title: 'Start', datetime: 'invalid-date' }
    ];

    render(<TxTimeline steps={steps} />);

    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    const steps = [
      { title: 'Start', datetime: '2024-03-15T11:55:00.000Z' },
      { title: 'Processing', datetime: '2024-03-15T12:00:00.000Z' },
      { title: 'Complete', datetime: '2024-03-15T12:05:00.000Z' }
    ];

    render(<TxTimeline steps={steps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('max', '100');
  });

});
