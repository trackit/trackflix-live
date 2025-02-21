import { Amplify } from 'aws-amplify';
import { Route, Routes } from 'react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { SnackbarProvider } from 'notistack';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { StatusView } from '@trackflix-live/status-view';
import Topbar from './topbar';

import { amplifyConfig } from '../amplify.config';

Amplify.configure(amplifyConfig);

export function App() {
  return (
    <Authenticator hideSignUp>
      <SnackbarProvider />
      <div className="flex flex-col h-screen">
        <Topbar />
        <div className="flex flex-col flex-grow dark:bg-base-300 bg-base-200 ">
          <Routes>
            <Route index element={<SingleAssetFlow />} />
            <Route path={'/status/:id'} element={<StatusView />} />
          </Routes>
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
