import { Amplify } from 'aws-amplify';
import { Route, Routes } from 'react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { ListAssetView } from '@trackflix-live/list-asset-view';
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
        <div
          className={
            'flex justify-center items-center w-screen h-full bg-base-200 relative'
          }
        >
          <Routes>
            <Route index element={<ListAssetView />} />
            <Route path={'/create'} element={<SingleAssetFlow />}></Route>
            <Route path={'/status/:id'} element={<StatusView />} />
          </Routes>
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
