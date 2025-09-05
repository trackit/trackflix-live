import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import StatusView from './status-view';
import * as allure from 'allure-js-commons';

describe('StatusView', () => {
  it('should render successfully', async () => {
    await allure.epic('MVP');
    await allure.feature('Live events');
    await allure.story('As a viewer, I want to view a live event');
    await allure.owner('Alexis le Dinh');
    await allure.severity('normal');

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
