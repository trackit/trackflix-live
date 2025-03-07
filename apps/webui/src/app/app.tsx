import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { fetchAuthSession } from 'aws-amplify/auth';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
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
        <div className="flex flex-col flex-grow dark:bg-base-300 bg-base-200 ">
          <Routes>
            <Route index element={<ListEventsView />} />
            <Route path={'/create'} element={<CreateEvent />}></Route>
            <Route path={'/status/:id'} element={<StatusView />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
