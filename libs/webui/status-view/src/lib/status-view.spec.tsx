import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import StatusView from './status-view';

describe('StatusView', () => {
  it('should render successfully', () => {
    const queryClient = new QueryClient();

    const { baseElement } = render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <StatusView />
        </QueryClientProvider>
      </BrowserRouter>
    );

    expect(baseElement).toBeTruthy();
  });
});
