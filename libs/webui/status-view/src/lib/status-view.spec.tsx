import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import StatusView from './status-view';
import * as allure from 'allure-js-commons';

describe('StatusView', () => {
  it('should render successfully', () => {
    allure.feature('Events management');
    allure.story('Event');
    allure.owner('Alexis le Dinh');
    allure.severity('normal');

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
