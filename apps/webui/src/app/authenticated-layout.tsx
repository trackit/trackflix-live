import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

import { postIot } from '@trackflix-live/api-client';
import { useUserStore } from '@trackflix-live/webui-stores';

import Topbar from './topbar';
import { AuthStyle } from './amplify-auth-theme';

// Rendered inside the Amplify Authenticator, so this only mounts once the user is signed in.
function AuthenticatedShell() {
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
        <div className="flex flex-col flex-grow dark:bg-base-300 bg-base-200">
          <Outlet />
        </div>
      </div>
    </>
  );
}

// Layout route for the authenticated part of the app: gates its child routes behind Cognito.
export function AuthenticatedLayout() {
  return (
    <AuthStyle>
      <AuthenticatedShell />
    </AuthStyle>
  );
}

export default AuthenticatedLayout;
