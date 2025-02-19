import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { Amplify } from 'aws-amplify';
import { AuthStyle } from './amplify-auth-theme';
import '@aws-amplify/ui-react/styles.css';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';

import { StatusView } from '@trackflix-live/status-view';
import Topbar from './topbar';

import { amplifyConfig } from '../amplify.config';
import { Route, Routes } from 'react-router';

Amplify.configure(amplifyConfig);

export function App() {
  return (
    <AuthStyle>
      <SnackbarProvider />
      <div className="flex flex-col h-screen">
        <Topbar />
        <div
          className={
            'flex justify-center items-center w-screen h-full bg-base-200 relative'
          }
        >
          <Routes>
            <Route index element={<SingleAssetFlow />} />
            <Route path={'/status/:id'} element={<StatusView />} />
          </Routes>
        </AuthStyle>
      </div>
    </div>
  );
}

export default App;
