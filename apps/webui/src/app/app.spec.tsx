import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeAll, describe, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as allure from 'allure-js-commons';

import App from './app';

// Mock matchMedia for Vitest
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('App', () => {
  it('should render successfully', () => {
    allure.feature('Essential features');
    allure.story('Basic functionality');
    allure.owner('Alexis Le Dinh');
    allure.severity('critical');

    const queryClient = new QueryClient();

    const { baseElement } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
