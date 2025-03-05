import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListAssetView from './list-asset-view';
import { listEvents } from '@trackflix-live/api-client';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

// Mock the API client properly
vi.mock('@trackflix-live/api-client', () => ({
  listEvents: vi.fn(), // Mock the listEvents function
}));

describe('ListAssetView', () => {
  const queryClient = new QueryClient();

  const renderWithClient = (ui: ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  const mockEvents = {
    events: [
      {
        id: '1',
        name: 'Event One',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '2',
        name: 'Event Two',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
    ],
    nextToken: 'next-token',
  };

  beforeEach(() => {
    // Use mockImplementation to return a resolved Promise
    (listEvents as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockEvents)
    );
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks between tests
  });

  it('renders loading state initially', () => {
    renderWithClient(<ListAssetView />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders events after loading', async () => {
    renderWithClient(<ListAssetView />);

    await waitFor(() => {
      expect(screen.getByText('Event One')).toBeInTheDocument();
      expect(screen.getByText('Event Two')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    renderWithClient(<ListAssetView />);

    await waitFor(() => {
      expect(screen.getByText('Event One')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Go to next page' });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(listEvents).toHaveBeenCalledWith({
        queryStringParameters: { limit: '10', nextToken: 'next-token' },
      });
    });
  });
});
