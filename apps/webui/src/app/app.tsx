import { Route, Routes } from 'react-router';

import { CreateEvent } from '@trackflix-live/create-event';
import { ListEventsView } from '@trackflix-live/list-events-view';
import { StatusView } from '@trackflix-live/status-view';

import { AuthenticatedLayout } from './authenticated-layout';
import { PublicMultiview } from './public-multiview';

export function App() {
  return (
    <Routes>
      {/* Public, unauthenticated route. */}
      <Route path={'/multiview'} element={<PublicMultiview />} />

      {/* Everything else is gated behind Cognito by the layout route. */}
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<ListEventsView />} />
        <Route path={'create'} element={<CreateEvent />} />
        <Route path={'status/:id'} element={<StatusView />} />
      </Route>
    </Routes>
  );
}

export default App;
