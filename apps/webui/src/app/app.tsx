import { Amplify } from 'aws-amplify';
import { Route, Routes } from 'react-router';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { StatusView } from '@trackflix-live/status-view';
import Topbar from './topbar';


import { amplifyConfig } from '../amplify.config';

Amplify.configure(amplifyConfig);

export function App() {
  return (
    <Authenticator hideSignUp>
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
        </div>
      </div>
    </Authenticator>
  );
}

export default App;
