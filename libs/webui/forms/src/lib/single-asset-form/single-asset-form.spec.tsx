import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingleAssetForm from './single-asset-form';
import '@testing-library/jest-dom';
import { DateTime } from 'luxon';

describe('SingleAssetForm', () => {
  const mockOnSubmit = vi.fn();
  const fixedDate = new Date('2024-01-01T10:00:00.000Z');

  beforeEach(() => {
    mockOnSubmit.mockClear();
    // Use a fake timer with a fixed date
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<SingleAssetForm onSubmit={mockOnSubmit} />);
    expect(baseElement).toBeTruthy();
  });

  it('should display all form inputs and submit button', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/s3 media uri/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start on air/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end on air/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should show error message for empty required fields', async () => {
    const user = userEvent.setup();
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup({ delay: null }); // Disable delay for faster tests
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in text inputs
    await user.type(screen.getByLabelText(/event name/i), 'Test Event');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    await user.type(
      screen.getByLabelText(/s3 media uri/i),
      's3://test-bucket/test-key'
    );

    // Handle datetime inputs
    const startInput = screen.getByLabelText(/start on air/i);
    const endInput = screen.getByLabelText(/end on air/i);

    // Set dates relative to our fixed date
    const startTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    const endTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 2 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    await user.clear(startInput);
    await user.type(startInput, startTime);
    await user.clear(endInput);
    await user.type(endInput, endTime);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );

    const [[submitData]] = mockOnSubmit.mock.calls;
    expect(submitData).toEqual({
      name: 'Test Event',
      description: 'Test Description',
      source: 's3://test-bucket/test-key',
      onAirStartTime: DateTime.fromJSDate(fixedDate)
        .plus({ hours: 1 })
        .startOf('minute')
        .toUTC()
        .toISO(),
      onAirEndTime: DateTime.fromJSDate(fixedDate)
        .plus({ hours: 2 })
        .startOf('minute')
        .toUTC()
        .toISO(),
    });
  });

  it('should show error for invalid S3 URI format', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/event name/i), 'Test Event');
    await user.type(screen.getByLabelText(/s3 media uri/i), 'invalid-uri');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/Must be a valid S3 URI/i)).toBeInTheDocument();
    });
  });

  it('should show error when end time is before start time', async () => {
    const user = userEvent.setup({ delay: null }); // Disable delay for faster tests
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/event name/i), 'Test Event');
    await user.type(
      screen.getByLabelText(/s3 media uri/i),
      's3://test-bucket/test-key'
    );

    const startTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 2 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    const endTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    const startInput = screen.getByLabelText(/start on air/i);
    const endInput = screen.getByLabelText(/end on air/i);

    await user.clear(startInput);
    await user.type(startInput, startTime);
    await user.clear(endInput);
    await user.type(endInput, endTime);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText(/End date must be after start date/i)
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} disabled={true} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
});
