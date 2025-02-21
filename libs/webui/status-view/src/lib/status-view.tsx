import { useEffect, useState } from 'react';
import {
  CloudCog,
  Link,
  Play,
  Check,
  CheckCheck,
  SquarePlay,
} from 'lucide-react';
import { Panel, Timeline, TxTimeline } from '@trackflix-live/ui';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { getEvent } from '@trackflix-live/api-client';
import { GetEventResponse, EventStatus } from '@trackflix-live/types';
import { pubsub } from '@trackflix-live/api-client';
import { CopyText } from '@trackflix-live/ui';

const getStatusColorClass = (status: EventStatus | undefined) => {
  switch (status) {
    case 'PRE-TX':
      return 'border-info text-info';
    case 'TX':
      return 'border-error text-error';
    case 'POST-TX':
    case 'CONFIRMED':
    case 'ENDED':
      return 'border-success text-success';
    default:
      return 'border-gray-500 text-gray-500';
  }
};

const getStatusIcon = (status: EventStatus | undefined) => {
  switch (status) {
    case 'PRE-TX':
      return <CloudCog className="w-4 h-4" />;
    case 'TX':
      return <Play className="w-4 h-4" />;
    case 'POST-TX':
      return <Check className="w-4 h-4" />;
    case 'CONFIRMED':
    case 'ENDED':
      return <CheckCheck className="w-4 h-4" />;
  }
};

export function StatusView() {
  const { id } = useParams();
  const { data, isLoading } = useQuery<GetEventResponse['body'] | null>({
    queryKey: ['event', id],
    queryFn: () => {
      if (!id) return null;
      return getEvent(id);
    },
  });
  const event = data?.event;
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

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
    { text: 'Creating MediaPackage', completed: true },
    { text: 'Creating MediaLive Channel', completed: true },
    { text: 'Creating MediaLive Input', completed: true },
    { text: 'Creating MediaLive Endpoint', loading: true },
    { text: 'Deleting MediaLive Endpoint' },
    { text: 'Deleting MediaLive Input' },
    { text: 'Deleting MediaLive Channel' },
    { text: 'Deleting MediaPackage' },
  ];

  // TODO remove this when backend is ready
  // Wait 10s before showing the player
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStreamUrl(
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      );
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    pubsub.subscribe({ topics: [import.meta.env.VITE_IOT_TOPIC] }).subscribe({
      // TODO fix type to real data
      // @ts-expect-error will replace type
      next: (data: { topic: string; message: string }) => {
        console.log(data);
      },
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="loading loading-ring loading-lg"></span>
        <p>Loading event data...</p>
      </div>
    );
  }

  return (
    <div className={' flex flex-col w-full justify-center items-center'}>
      <div className={'container px-4'}>
        <div className="w-full flex-grow mt-10 flex justify-between items-center">
          <div className={'flex flex-col gap-1 prose'}>
            <h1 className={'mb-0'}>{event?.name}</h1>
            <p className={'m-0'}>{event?.description}</p>
          </div>
          {event?.status && (
            <div
              className={`flex items-center gap-2 text-center text-sm font-extrabold border rounded-lg p-2 ${getStatusColorClass(
                event.status
              )}`}
            >
              {getStatusIcon(event?.status)}
              {event?.status === 'TX' ? 'On Air (TX)' : event?.status}
            </div>
          )}
        </div>
        <div className={'flex flex-col items-center'}>
          <div
            className={
              'flex justify-center items-center w-full mt-20 mb-20 px-8'
            }
          >
            <div className={'w-full'}>
              <TxTimeline steps={txSteps} />
            </div>
          </div>

          <Panel className={'w-full min-w-[80dvw]'}>
            {streamUrl && (
              <>
                <CopyText text={streamUrl} icon={<Link />} />
                <hr className={'my-6'} />
              </>
            )}
            <div className={'flex'}>
              <div className={'w-1/3 p-4'}>
                <Timeline steps={devTimelineSteps} />
              </div>
              <div className={'flex-grow w-1/2'}>
                {streamUrl ? (
                  <video controls muted={true} autoPlay={true}>
                    <source src={streamUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-base-200 rounded-lg p-4 shadow-inner text-base-content/40">
                    <SquarePlay className="w-12 h-12" />
                    <p>Player will be available soon</p>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default StatusView;
