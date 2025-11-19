import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListAssetView from './list-events-view';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import * as allure from 'allure-js-commons';
import {
  EventsRepositoryFake,
  eventsRepositorySingleton,
} from '@trackflix-live/api-client';

// Mock the repository
const eventsRepository = new EventsRepositoryFake();
eventsRepositorySingleton.override(eventsRepository);

describe('ListEventsView', () => {
  const queryClient = new QueryClient();

  const renderWithClient = (ui: ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to list live events');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    renderWithClient(<ListAssetView />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders events after loading', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to list live events');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    eventsRepository.reset();
    for (let i = 0; i < 10; i++) {
      await eventsRepository.createEvent({
        name: `Event ${i}`,
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        description: 'My event',
        source: 'my-source',
      });
    }

    renderWithClient(<ListAssetView />);

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to list live events');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    eventsRepository.reset();
    for (let i = 0; i < 20; i++) {
      await eventsRepository.createEvent({
        name: `Event ${i}`,
        onAirStartTime: '2024-02-25T15:00:00Z',
        onAirEndTime: '2024-02-25T17:00:00Z',
        description: 'My event',
        source: 'my-source',
      });
    }

    const listEventsSpy = vi.spyOn(eventsRepository, 'listEvents');

    renderWithClient(<ListAssetView />);

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: 'Go to next page' });
    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(listEventsSpy).toHaveBeenCalledWith({
        queryStringParameters: {
          limit: '10',
          nextToken: '10',
          name: '',
          sortBy: 'onAirStartTime',
          sortOrder: 'desc',
        },
      });
    });
  });
});
