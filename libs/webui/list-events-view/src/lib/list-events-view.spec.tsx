import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListAssetView from './list-events-view';
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

describe('ListEventsView', () => {
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
      {
        id: '3',
        name: 'Event Three',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '4',
        name: 'Event Four',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '5',
        name: 'Event Five',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '6',
        name: 'Event Six',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '7',
        name: 'Event Seven',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '8',
        name: 'Event Eight',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '9',
        name: 'Event Nine',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '10',
        name: 'Event Ten',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '11',
        name: 'Event Eleven',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '12',
        name: 'Event Twelve',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '13',
        name: 'Event Thirteen',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '14',
        name: 'Event Fourteen',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '15',
        name: 'Event Fifteen',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '16',
        name: 'Event Sixteen',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '17',
        name: 'Event Seventeen',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '18',
        name: 'Event Eighteen',
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        status: 'Live',
      },
      {
        id: '19',
        name: 'Event Nineteen',
        onAirStartTime: '2024-02-24T12:00:00Z',
        onAirEndTime: '2024-02-24T14:00:00Z',
        status: 'Scheduled',
      },
      {
        id: '20',
        name: 'Event Twenty',
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
        queryStringParameters: {
          limit: '10',
          nextToken: 'next-token',
          name: '',
          sortBy: 'onAirStartTime',
          sortOrder: 'desc',
        },
      });
    });
  });
});
