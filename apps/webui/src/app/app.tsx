import { Route, Routes } from 'react-router';
import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { ThemeSwitcher } from '@trackflix-live/ui';
import { StatusView } from '@trackflix-live/status-view';

export function App() {
  return (
    <div className={'prose   '}>
      <div className={'absolute top-2 right-2'}>
        <ThemeSwitcher />
      </div>

      <div
        className={
          'flex justify-center items-center w-screen h-screen bg-base-200'
        }
      >
        <Routes>
          <Route index element={<SingleAssetFlow />} />
          <Route path={'/status/:id'} element={<StatusView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
