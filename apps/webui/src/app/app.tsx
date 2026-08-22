import { Route, Routes } from 'react-router';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
import { StatusView } from '@trackflix-live/status-view';

import { AuthenticatedLayout } from './authenticated-layout';
import { AuthStyle } from './amplify-auth-theme';
import { PublicMultiview } from './public-multiview';

export function App() {
  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<ListEventsView />} />
        <Route path={'create'} element={<CreateEvent />} />
        <Route path={'status/:id'} element={<StatusView />} />
      </Route>
      {/* MultiView is kept behind Cognito to avoid leaking the live feeds, but keeps the public demo
          shell (its own navbar) instead of the app Topbar. Drop the AuthStyle wrapper to make it
          fully public again. */}
      <Route
        path={'multiview'}
        element={
          <AuthStyle fullBleed>
            <PublicMultiview />
          </AuthStyle>
        }
      />
    </Routes>
  );
}

export default App;
