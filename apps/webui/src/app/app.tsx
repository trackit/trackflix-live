import { Route, Routes } from 'react-router';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
import { StatusView } from '@trackflix-live/status-view';

import { AuthenticatedLayout } from './authenticated-layout';
import { PublicMultiview } from './public-multiview';

export function App() {
  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<ListEventsView />} />
        <Route path={'create'} element={<CreateEvent />} />
        <Route path={'status/:id'} element={<StatusView />} />
      </Route>
      {/* Public, unauthenticated MultiView demo. To gate it behind Cognito again, wrap the element in
          <AuthStyle fullBleed> (keeps the demo shell edge to edge). */}
      <Route path={'multiview'} element={<PublicMultiview />} />
    </Routes>
  );
}

export default App;
