import { SingleAssetFlow } from '@trackflix-live/single-asset-flow';
import { Panel, ThemeSwitcher, TimeDatePicker } from '@trackflix-live/ui';
import { useState } from 'react';

export function App() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  console.log(date);
  return (
    <div className={'prose   '}>
      <div className={'absolute top-2 right-2'}>
        <ThemeSwitcher />
      </div>

      <div
        className={
          'flex justify-center items-center gap-4 flex-col w-screen h-screen bg-base-200'
        }
      >
        <Panel>
          <TimeDatePicker
            color={'bg-base-100'}
            setValue={setDate}
            value={date}
          />
        </Panel>
        <Panel>
          <h1>Trackflix Live</h1>
          <SingleAssetFlow />
        </Panel>
      </div>
    </div>
  );
}

export default App;
