import {SingleAssetFlow} from "@trackflix-live/single-asset-flow";
import { Panel, ThemeSwitcher, TxTimeline } from '@trackflix-live/ui';
import { DateTime } from 'luxon';

export function App() {

  const devSteps = [
    { title: 'Pre-TX', datetime:  DateTime.now().toISO()},
    { title: 'TX', datetime:  DateTime.now().plus({ seconds: 10 }).toISO()},
    { title: 'Post-TX', datetime:  DateTime.now().plus({ seconds: 10}).plus({ minutes: 1 }).toISO()},
    { title: 'End'},

  ];

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
          <hr/>
          <div className="px-10 py-4">  
            <TxTimeline steps={devSteps} />
          </div>
            <hr/>
            <SingleAssetFlow />
        </Panel>
      </div>
    </div>
  );
}

export default App;
