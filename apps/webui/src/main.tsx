import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { AuthStyle } from './app/amplify-auth-theme';
import App from './app/app';
import { amplifyConfig } from './amplify.config';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

Amplify.configure(amplifyConfig);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthStyle>
          <App />
        </AuthStyle>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
