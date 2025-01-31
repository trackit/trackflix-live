import { Clock, Panel, Timeline, TxTimeline } from '@trackflix-live/ui';
import { DateTime } from 'luxon';

export function StatusView() {
  const devSteps = [
    { title: 'Pre-TX', datetime: DateTime.now().toISO() },
    { title: 'TX', datetime: DateTime.now().plus({ seconds: 10 }).toISO() },
    {
      title: 'Post-TX',
      datetime: DateTime.now()
        .plus({ seconds: 10 })
        .plus({ minutes: 1 })
        .toISO(),
    },
    { title: 'End' },
  ];

  const devTimelineSteps = [
    { text: 'Creating entity 1', completed: true },
    { text: 'Creating entity 2', completed: true },
    { text: 'Creating entity 3', completed: true },
    { text: 'Creating entity 4', loading: true },
    { text: 'Creating entity 5' },
  ];

  return (
    <div>
      <Panel className={'w-full min-w-[80dvw]'}>
        <div className={'flex justify-between items-center mb-8'}>
          <h1 className={'mb-0'}>Status</h1>
          <Clock />
        </div>
        <div className={'p-8'}>
          <TxTimeline steps={devSteps} />
        </div>
        <hr className={'mb-6'} />
        <div className={'flex'}>
          <div className={'w-1/3'}>
            <Timeline steps={devTimelineSteps} />
          </div>
          <div className={'flex-grow'}>
            <video controls muted={true} autoPlay={true}>
              <source
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default StatusView;
