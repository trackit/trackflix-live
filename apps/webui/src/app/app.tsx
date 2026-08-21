import { Route, Routes } from 'react-router';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
import { StatusView } from '@trackflix-live/status-view';
import { MultiviewView } from '@trackflix-live/multiview';

import { AuthenticatedLayout } from './authenticated-layout';

export function App() {
  return (
    <Routes>
      {/* Everything is gated behind Cognito by the layout route. The MultiView demo is temporarily
          kept behind auth (it used to be a public route) to avoid leaking the live feeds; re-expose
          it by rendering PublicMultiview on a top-level route again when it should go public. */}
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<ListEventsView />} />
        <Route path={'create'} element={<CreateEvent />} />
        <Route path={'status/:id'} element={<StatusView />} />
        <Route path={'multiview'} element={<MultiviewView />} />
      </Route>
    </Routes>
  );
}

export default App;
