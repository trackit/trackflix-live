import { useEffect, useState } from 'react';
import {
  CloudCog,
  Link,
  Play,
  Check,
  CheckCheck,
  SquarePlay,
} from 'lucide-react';
import {
  Panel,
  Timeline,
  TxTimeline,
  TimelineStep,
  Step,
} from '@trackflix-live/ui';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { getEvent } from '@trackflix-live/api-client';
import {
  GetEventResponse,
  EventStatus,
  LogType,
  Event,
} from '@trackflix-live/types';
import { pubsub } from '@trackflix-live/api-client';
import { CopyText } from '@trackflix-live/ui';

const PRE_TX_TIME = 5;

type TimelineStepWithLog = TimelineStep & { id: LogType };

const getStatusColorClass = (status: EventStatus | undefined) => {
  switch (status) {
    case 'PRE-TX':
      return 'border-info text-info';
    case 'TX':
      return 'border-error text-error';
    case 'POST-TX':
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
    case 'ENDED':
      return <CheckCheck className="w-4 h-4" />;
  }
};

const initialTimelineSteps: TimelineStepWithLog[] = [
  {
    text: 'Create MediaPackage Channel',
    id: LogType.PACKAGE_CHANNEL_CREATED,
  },
  {
    text: 'Create MediaLive Input',
    id: LogType.LIVE_INPUT_CREATED,
  },
  {
    text: 'Create MediaLive Channel',
    id: LogType.LIVE_CHANNEL_CREATED,
  },
  {
    text: 'Start MediaLive Channel',
    id: LogType.LIVE_CHANNEL_STARTED,
  },
  {
    text: 'Stop MediaLive Channel',
    id: LogType.LIVE_CHANNEL_STOPPED,
  },
  {
    text: 'Delete MediaLive Channel',
    id: LogType.LIVE_CHANNEL_DESTROYED,
  },
  {
    text: 'Delete MediaLive Input',
    id: LogType.LIVE_INPUT_DESTROYED,
  },
  {
    text: 'Delete MediaPackage Channel',
    id: LogType.PACKAGE_CHANNEL_DESTROYED,
  },
];

const getTxSteps = (event: Event): Step[] => {
  const isEnded = event?.status === 'ENDED';
  const endTime = isEnded
    ? event?.logs[event?.logs.length - 1].timestamp
    : undefined;

  return [
    { title: 'Created', datetime: event?.createdTime },
    {
      title: 'Pre-TX',
      datetime:
        DateTime.fromISO(event?.onAirStartTime || '')
          .minus({
            minutes: PRE_TX_TIME,
          })
          .toISO() || undefined,
    },
    { title: 'TX', datetime: event?.onAirStartTime },
    {
      title: 'Post-TX',
      datetime: event?.onAirEndTime,
    },
    {
      title: 'End',
      datetime: endTime
        ? DateTime.fromMillis(endTime).toISO() || undefined
        : undefined,
    },
  ];
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
  const [event, setEvent] = useState<Event | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [timelineSteps, setTimelineSteps] =
    useState<TimelineStepWithLog[]>(initialTimelineSteps);

  const [txSteps, setTxSteps] = useState<Step[]>(
    event ? getTxSteps(event) : []
  );

  useEffect(() => {
    if (data && data.event) {
      setEvent(data.event);
      setTxSteps(getTxSteps(data.event));
    }
  }, [data]);

  // On event update, update the timeline steps
  useEffect(() => {
    if (event && event.logs) {
      const newTimelineSteps = timelineSteps.map((step) => {
        const log = event.logs.find((log) => log.type === step.id);
        return {
          ...step,
          completed: log ? true : false,
          datetime: log
            ? DateTime.fromMillis(log.timestamp).toISO() || undefined
            : undefined,
        };
      });
      setTimelineSteps(newTimelineSteps);
    }
    if (event?.status === 'ENDED') {
      const updatedTxSteps = [...txSteps];
      updatedTxSteps[updatedTxSteps.length - 1] = {
        title: 'End',
        datetime: event?.onAirEndTime,
      };
      setTxSteps(updatedTxSteps);
    }
  }, [event]);

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
      next: (value) => {
        const msg = value as { action: string; value: Event };
        console.log(msg);
        if (msg.value) {
          setEvent(msg.value);
        }
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
              className={`flex bg-base-100 items-center gap-2 text-center text-sm font-extrabold border rounded-lg p-2 ${getStatusColorClass(
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
              <TxTimeline
                steps={txSteps}
                completed={event?.status === 'ENDED'}
              />
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
                <Timeline steps={timelineSteps} />
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
