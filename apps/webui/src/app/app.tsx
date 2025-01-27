import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { Panel, ThemeSwitcher, TimeDatePicker } from '@trackflix-live/ui';
import { useState } from 'react';

export function App() {
  const [selected, setSelected] = useState<Date | undefined>();

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
        <Panel>
          <h1>Trackflix Live</h1>
          <SingleAssetFlow />
          <TimeDatePicker selected={selected} setSelected={setSelected} />
        </Panel>
      </div>
    </div>
  );
}

export default App;
