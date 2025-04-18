import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingleAssetForm from './single-asset-form';
import '@testing-library/jest-dom';
import { DateTime } from 'luxon';
import { InputType } from '@trackflix-live/types';

describe('SingleAssetForm', () => {
  const mockOnSubmit = vi.fn();
  const fixedDate = new Date('2024-01-01T11:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    mockOnSubmit.mockReset();
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
    expect(screen.getByText(/input type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start on-air/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end on-air/i)).toBeInTheDocument();
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
    
    // Select MP4_FILE input type and fill in URL
    const inputTypeSelect = screen.getByRole('combobox');
    await user.selectOptions(inputTypeSelect, InputType.MP4_FILE);
    await user.type(screen.getByLabelText(/s3 media uri/i), 's3://test-bucket/test-key');

    // Handle datetime inputs
    const startInput = screen.getByLabelText(/start on-air/i);
    const endInput = screen.getByLabelText(/end on-air/i);

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
      source: {
        value: 's3://test-bucket/test-key',
        inputType: InputType.MP4_FILE,
      },
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
    
    const inputTypeSelect = screen.getByRole('combobox');
    await user.selectOptions(inputTypeSelect, InputType.MP4_FILE);
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
    
    // Select MP4_FILE input type and fill in URL
    const inputTypeSelect = screen.getByRole('combobox');
    await user.selectOptions(inputTypeSelect, InputType.MP4_FILE);
    await user.type(screen.getByLabelText(/s3 media uri/i), 's3://test-bucket/test-key');

    const startTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 2 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    const endTime = DateTime.fromJSDate(fixedDate)
      .plus({ hours: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    const startInput = screen.getByLabelText(/start on-air/i);
    const endInput = screen.getByLabelText(/end on-air/i);

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
  
  it('should render different input fields based on input type selection', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);
    
    const inputTypeSelect = screen.getByRole('combobox');
    
    // Test MP4_FILE input type
    await user.selectOptions(inputTypeSelect, InputType.MP4_FILE);
    expect(screen.getByLabelText(/s3 media uri/i)).toBeInTheDocument();
    
    // Test RTP_PUSH input type
    await user.selectOptions(inputTypeSelect, InputType.RTP_PUSH);
    expect(screen.getByLabelText(/network location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/security group/i)).toBeInTheDocument();
    
    // Test SRT_CALLER input type
    await user.selectOptions(inputTypeSelect, InputType.SRT_CALLER);
    expect(screen.getByRole('textbox', { name: /stream id/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /srt listener address/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /decryption algorithm/i })).toBeInTheDocument();
  });
});
