import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleAssetForm } from './single-asset-form';
import { InputType } from '@aws-sdk/client-medialive';
import { vi } from 'vitest';
import { DateTime } from 'luxon';
import { InputType } from '@trackflix-live/types';

describe('SingleAssetForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with default values', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Event Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Input Type')).toBeInTheDocument();
    expect(screen.getByText('Start On-Air')).toBeInTheDocument();
    expect(screen.getByText('End On-Air')).toBeInTheDocument();
  });

  it('shows S3 URL field when MP4_FILE input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.MP4_FILE },
    });

    expect(screen.getByText('S3 Media URI')).toBeInTheDocument();
  });

  it('shows RTP push fields when RTP_PUSH input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.RTP_PUSH },
    });

    expect(screen.getByText('Security Groups')).toBeInTheDocument();
  });

  it('shows RTMP push fields when RTMP_PUSH input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.RTMP_PUSH },
    });

    expect(screen.getByText('Security Groups')).toBeInTheDocument();
    expect(screen.getByText('Stream Name')).toBeInTheDocument();
  });

  it('shows RTMP pull fields when RTMP_PULL input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.RTMP_PULL },
    });

    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('shows MediaConnect fields when MEDIA_CONNECT input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.MEDIACONNECT },
    });

    expect(screen.getByText('Flow ARN')).toBeInTheDocument();
    expect(screen.getByText('Role ARN')).toBeInTheDocument();
  });

  it('shows SRT caller fields when SRT_CALLER input type is selected', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.SRT_CALLER },
    });

    expect(screen.getByText('Stream ID')).toBeInTheDocument();
    expect(screen.getByText('SRT Listener Port')).toBeInTheDocument();
    expect(screen.getByText('SRT Listener Address')).toBeInTheDocument();
    expect(screen.getByText('Enable SRT Decryption')).toBeInTheDocument();
  });

  it('updates end time automatically when start time changes', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const startTimeInput = screen.getByLabelText('Start On-Air');
    const endTimeInput = screen.getByLabelText('End On-Air');

    const newStartTime = DateTime.now()
      .plus({ days: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    fireEvent.change(startTimeInput, { target: { value: newStartTime } });

    // End time should be updated to start time + 1 hour
    const expectedEndTime = DateTime.fromFormat(
      newStartTime,
      "yyyy-MM-dd'T'HH:mm"
    )
      .plus({ hours: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    expect((endTimeInput as HTMLInputElement).value).toBe(expectedEndTime);
  });

  it('does not update end time when it has been manually set', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const startTimeInput = screen.getByLabelText('Start On-Air');
    const endTimeInput = screen.getByLabelText('End On-Air');

    // First manually set the end time
    const manualEndTime = DateTime.now()
      .plus({ days: 2 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    fireEvent.change(endTimeInput, { target: { value: manualEndTime } });

    // Then change the start time
    const newStartTime = DateTime.now()
      .plus({ days: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    fireEvent.change(startTimeInput, { target: { value: newStartTime } });

    // End time should remain the manually set value
    expect((endTimeInput as HTMLInputElement).value).toBe(manualEndTime);
  });

  it('validates form submission with required fields', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    const s3UrlInput = screen.getByLabelText('S3 Media URI');
    fireEvent.change(s3UrlInput, {
      target: { value: 's3://test-bucket/video.mp4' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('shows validation errors when form is submitted with invalid data', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Leave name empty
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText('String must contain at least 1 character(s)')
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates S3 URL format for MP4 files', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in name
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Enter invalid S3 URL
    const s3UrlInput = screen.getByLabelText('S3 Media URI');
    fireEvent.change(s3UrlInput, { target: { value: 'invalid-url' } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be a valid s3 uri/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows error messages for invalid input fields', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      // Check name validation
      expect(
        screen.getByText('String must contain at least 1 character(s)')
      ).toBeInTheDocument();

      // Check S3 URL validation for MP4 input type
      expect(
        screen.getByText(
          'Must be a valid S3 URI pointing to a MP4 file (e.g., s3://bucket-name/video.mp4)'
        )
      ).toBeInTheDocument();
    });
  });

  it('shows error message for invalid date range', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const startTimeInput = screen.getByLabelText('Start On-Air');
    const endTimeInput = screen.getByLabelText('End On-Air');

    // Set end time before start time
    const startTime = DateTime.now()
      .plus({ days: 2 })
      .toFormat("yyyy-MM-dd'T'HH:mm");
    const endTime = DateTime.now()
      .plus({ days: 1 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    fireEvent.change(startTimeInput, { target: { value: startTime } });
    fireEvent.change(endTimeInput, { target: { value: endTime } });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText('End date must be after start date')
      ).toBeInTheDocument();
    });
  });

  it('validates S3 URL format for MP4 files', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in name
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Select MP4 file input type
    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.MP4_FILE },
    });

    // Enter invalid S3 URL
    const s3UrlInput = screen.getByLabelText('S3 Media URI');
    fireEvent.change(s3UrlInput, {
      target: { value: 's3://test-bucket/video.notMp4' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid S3 URI pointing to a MP4 file/i)
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates S3 URL format for TS files', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in name
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Select TS file input type
    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, { target: { value: InputType.TS_FILE } });

    // Enter invalid S3 URL
    const s3UrlInput = screen.getByLabelText('S3 Media URI');
    fireEvent.change(s3UrlInput, {
      target: { value: 's3://test-bucket/video.notTs' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Must be a valid S3 URI pointing to a TS file/i)
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates S3 URL format for HLS files', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Fill in name
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Select HLS file input type
    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.URL_PULL },
    });

    // Enter invalid S3 URL
    const urlInput = screen.getByLabelText('URL');
    fireEvent.change(urlInput, {
      target: { value: 'https://test-bucket/video.notM3u8' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Must be a valid HTTP\/HTTPS URL pointing to a M3U8 file/i
        )
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates SRT caller fields with decryption enabled', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Select SRT caller input type
    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.SRT_CALLER },
    });

    // Fill required fields
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Enable decryption
    const decryptionToggle = screen.getByLabelText('Enable SRT Decryption');
    fireEvent.click(decryptionToggle);

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      // Check validation errors
      expect(screen.getByText('Stream ID cannot be empty')).toBeInTheDocument();
      expect(
        screen.getByText('SRT Listener Port cannot be empty')
      ).toBeInTheDocument();
      expect(
        screen.getByText('SRT Listener Address cannot be empty')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Passphrase Secret ARN must be provided if decryption is enabled'
        )
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('validates SRT caller fields with decryption disabled', async () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    // Select SRT caller input type
    const inputTypeSelect = screen.getByLabelText('Input Type');
    fireEvent.change(inputTypeSelect, {
      target: { value: InputType.SRT_CALLER },
    });

    // Fill required fields
    const nameInput = screen.getByLabelText('Event Name');
    fireEvent.change(nameInput, { target: { value: 'Test Asset' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      // Check validation errors
      expect(screen.getByText('Stream ID cannot be empty')).toBeInTheDocument();
      expect(
        screen.getByText('SRT Listener Port cannot be empty')
      ).toBeInTheDocument();
      expect(
        screen.getByText('SRT Listener Address cannot be empty')
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          'Passphrase Secret ARN must be provided if decryption is enabled'
        )
      ).not.toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
