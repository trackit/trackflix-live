import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SingleAssetForm from './single-asset-form';
import '@testing-library/jest-dom';

describe('SingleAssetForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<SingleAssetForm onSubmit={mockOnSubmit} />);
    expect(baseElement).toBeTruthy();
  });

  it('should display URL input and submit button', () => {
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText('https://foo.bar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call onSubmit with valid URL', async () => {
    const user = userEvent.setup();
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('https://foo.bar');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await act(async () => {
      await user.type(input, 'https://example.com/video.mp4');
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnSubmit.mock.lastCall[0]).toEqual({
        assetUrl: 'https://example.com/video.mp4',
      });
    });
  });

  it('should show error message for invalid URL', async () => {
    const user = userEvent.setup();
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('https://foo.bar');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await act(async () => {
      await user.type(input, 'not-a-url');
      await user.click(submitButton);
    });

    await screen.findByText(/Invalid url/i);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should apply error styles to input when URL is invalid', async () => {
    const user = userEvent.setup();
    render(<SingleAssetForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText('https://foo.bar');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await act(async () => {
      await user.type(input, 'not-a-url');
      await user.click(submitButton);
    });

    const inputContainer = input.closest('.input');
    await waitFor(() => {
      expect(inputContainer).toHaveClass('input-error');
    });
  });
});
