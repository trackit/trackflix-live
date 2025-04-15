import { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
import { StatusView } from '@trackflix-live/status-view';
import { postIot } from '@trackflix-live/api-client';

import Topbar from './topbar';
import { useUserStore } from '@trackflix-live/webui-stores';

export function App() {
  const { setUserSession, setUser } = useUserStore();

  useEffect(() => {
    const postIotWithCognitoIdentity = async () => {
      try {
        const session = await fetchAuthSession();
        setUserSession(session);
        if (session.identityId)
          await postIot({ identityId: session.identityId });
      } catch (error) {
        console.error('Error attaching IoT Core to cognito identity:', error);
      }
    };
    postIotWithCognitoIdentity();
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
      })
      .catch(console.error);
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
