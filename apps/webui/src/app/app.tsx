import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { fetchAuthSession } from 'aws-amplify/auth';

import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { StatusView } from '@trackflix-live/status-view';
import { postIot } from '@trackflix-live/api-client';

import Topbar from './topbar';

export function App() {
  useEffect(() => {
    const postIotWithCognitoIdentity = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.identityId)
          await postIot({ identityId: session.identityId });
      } catch (error) {
        console.error('Error attaching IoT Core to cognito identity:', error);
      }
    };
    postIotWithCognitoIdentity();
  }, []);

  return (
    <>
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
        </div>
      </div>
    </>
  );
}

export default App;
