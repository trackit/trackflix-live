import {SingleAssetFlow} from "@trackflix-live/single-asset-flow";
import { Panel, ThemeSwitcher, TxTimeline, Clock, Timeline } from '@trackflix-live/ui';
import { DateTime } from 'luxon';

export function App() {

  const devSteps = [
    { title: 'Pre-TX', datetime:  DateTime.now().toISO()},
    { title: 'TX', datetime:  DateTime.now().plus({ seconds: 10 }).toISO()},
    { title: 'Post-TX', datetime:  DateTime.now().plus({ seconds: 10}).plus({ minutes: 1 }).toISO()},
    { title: 'End'},
  ];

  const devTimelineSteps = [
    { text: 'Creating entity 1', completed: true },
    { text: 'Creating entity 2', completed: true },
    { text: 'Creating entity 3', completed: true },
    { text: 'Creating entity 4', loading: true },
    { text: 'Creating entity 5' },
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
          <div className={'relative'}>
            <h1>Trackflix Live</h1>

            <div className={'absolute right-0 top-0'}>

              <Clock />
            </div>
          </div>
          <hr />
          <div className="px-10 py-4">
            <TxTimeline steps={devSteps} />
          </div>
          <hr />
          <div className={'flex'}>
            <div className={'px-4'}>
            <Timeline steps={devTimelineSteps} />
            </div>
            <div className={'flex-grow'}>

          <SingleAssetFlow />
            </div>


          </div>
        </Panel>
      </div>
    </div>
  );
}

export default App;
