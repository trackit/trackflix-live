import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import CreateEvent from './create-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import * as allure from 'allure-js-commons';
import {
  eventsRepositorySingleton,
  EventsRepositoryFake,
} from '@trackflix-live/api-client';

// Mock the repository
const eventsRepository = new EventsRepositoryFake();
eventsRepositorySingleton.override(eventsRepository);

// Mock the user store
vi.mock('@trackflix-live/webui-stores', () => ({
  useUserStore: vi.fn(() => ({
    isCreator: true,
  })),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render successfully', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    const { baseElement } = render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
    expect(screen.getByText('Create a new event')).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    );

    const submitButton = screen.getByText('Submit Form');
    fireEvent.click(submitButton);

    // Check if event was created
    expect(
      (await eventsRepository.listEvents({ queryStringParameters: {} })).events
    ).toMatchInlineSnapshot([
      {
        createdTime: '1970-01-01T00:00:00.000Z',
        endpoints: [],
        id: '0',
        logs: [],
        status: 'PRE-TX',
        title: 'Test Event',
      },
    ]);

    // Wait for navigation
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should handle submission errors', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a creator, I want to create a live event');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

    // Mock console.error to prevent error output in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    // Repository spy
    vi.spyOn(eventsRepository, 'createEvent').mockRejectedValueOnce(
      new Error('Mock Error')
    );

    render(
      <MemoryRouter>
        <CreateEvent />
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
