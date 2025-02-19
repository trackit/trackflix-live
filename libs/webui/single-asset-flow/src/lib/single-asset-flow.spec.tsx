import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import SingleAssetFlow from './single-asset-flow';
import { postEvent } from '@trackflix-live/api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock the api-client
vi.mock('@trackflix-live/api-client', () => ({
  postEvent: vi.fn(),
}));

// Mock the SingleAssetForm component
vi.mock('@trackflix-live/forms', () => ({
  SingleAssetForm: ({ onSubmit, disabled }: any) => (
    <button
      onClick={() => onSubmit({ title: 'Test Event' })}
      disabled={disabled}
    >
      Submit Form
    </button>
  ),
}));

describe('SingleAssetFlow', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    (postEvent as any).mockResolvedValue({
      event: { id: '123' },
    });
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <SingleAssetFlow />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
    expect(screen.getByText('Create a new event')).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    render(
      <MemoryRouter>
        <SingleAssetFlow />
      </MemoryRouter>
    );

    const submitButton = screen.getByText('Submit Form');
    fireEvent.click(submitButton);

    // Check if postEvent was called
    expect(postEvent).toHaveBeenCalledWith({ title: 'Test Event' });

    // Wait for navigation
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should handle submission errors', async () => {
    // Mock console.error to prevent error output in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock API error
    (postEvent as any).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter>
        <SingleAssetFlow />
      </MemoryRouter>
    );

    const submitButton = screen.getByText('Submit Form');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
