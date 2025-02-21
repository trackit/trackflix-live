import { useEffect, useState } from 'react';
import { Clock, Panel, Timeline, TxTimeline } from '@trackflix-live/ui';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { getEvent } from '@trackflix-live/api-client';
import { GetEventResponse } from '@trackflix-live/types';
import { pubsub } from '@trackflix-live/api-client';

type LiveMessage = {
  message: string;
  datetime: string;
};

export function StatusView() {
  const { id } = useParams();
  const { data } = useQuery<GetEventResponse['body'] | null>({
    queryKey: ['event', id],
    queryFn: () => {
      if (!id) return null;
      return getEvent(id);
    },
  });
  const event = data?.event;

  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([
    {
      datetime: DateTime.now().toISO(),
      message: 'Listening for live events ...',
    },
  ]);

  const txSteps = [
    // TODO add created event time here
    { title: 'Pre-TX', datetime: DateTime.now().toISO() },
    { title: 'TX', datetime: event?.onAirStartTime },
    {
      title: 'Post-TX',
      datetime: event?.onAirEndTime,
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

  useEffect(() => {
    pubsub.subscribe({ topics: [import.meta.env.VITE_IOT_TOPIC] }).subscribe({
      // TODO fix type to real data
      // @ts-expect-error will replace type
      next: (data: { topic: string; message: string }) => {
        console.log(data);
        setLiveMessages((prev) => [
          {
            datetime: DateTime.now().toISO(),
            message: data.message,
          },
          ...prev,
        ]);
      },
    });
  }, []);

  return (
    <div className={'flex flex-col flex-grow'}>
      <div className="w-full">
        <TxTimeline steps={txSteps} />
      </div>
      <div
        className={
          'flex justify-center items-center w-screen h-full bg-base-200 relative'
        }
      >
        <Panel className={'w-full min-w-[80dvw]'}>
          <div className={'flex justify-between items-center mb-8'}>
            <h1 className={'mb-0'}>Status</h1>
            <Clock />
          </div>
          <div className={'p-8'}></div>
          <hr className={'m-6'} />
          <div className={'flex'}>
            <div className={'w-1/3 p-4'}>
              <Timeline steps={devTimelineSteps} />
            </div>
            <div className={'flex-grow w-1/2'}>
              <video controls muted={true} autoPlay={false}>
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
    </div>
  );
}

export default StatusView;
