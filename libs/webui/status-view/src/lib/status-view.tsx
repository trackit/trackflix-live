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
  VideoPlayer,
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

const PRE_TX_TIME = 15;

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

const getTimelineSteps = (event: Event): TimelineStepWithLog[] => {
  const res: TimelineStepWithLog[] = [
    {
      id: LogType.PACKAGE_CHANNEL_CREATED,
      text: 'Create MediaPackage Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.PACKAGE_CHANNEL_CREATED
      ),
    },
    {
      id: LogType.LIVE_INPUT_CREATED,
      text: 'Create MediaLive Input',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_INPUT_CREATED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type ===
        LogType.PACKAGE_CHANNEL_CREATED,
    },
    {
      id: LogType.LIVE_CHANNEL_CREATED,
      text: 'Create MediaLive Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_CHANNEL_CREATED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type === LogType.LIVE_INPUT_CREATED,
    },
    {
      id: LogType.LIVE_CHANNEL_STARTED,
      text: 'Start MediaLive Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_CHANNEL_STARTED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type ===
        LogType.LIVE_CHANNEL_CREATED,
    },
    {
      id: LogType.LIVE_CHANNEL_STOPPED,
      text: 'Stop MediaLive Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_CHANNEL_STOPPED
      ),
    },
    {
      id: LogType.LIVE_CHANNEL_DESTROYED,
      text: 'Delete MediaLive Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_CHANNEL_DESTROYED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type ===
        LogType.LIVE_CHANNEL_STOPPED,
    },
    {
      id: LogType.LIVE_INPUT_DESTROYED,
      text: 'Delete MediaLive Input',
      completed: event.logs.some(
        (log) => log.type === LogType.LIVE_INPUT_DESTROYED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type ===
        LogType.LIVE_CHANNEL_DESTROYED,
    },
    {
      id: LogType.PACKAGE_CHANNEL_DESTROYED,
      text: 'Delete MediaPackage Channel',
      completed: event.logs.some(
        (log) => log.type === LogType.PACKAGE_CHANNEL_DESTROYED
      ),
      loading:
        event.logs[event.logs.length - 1]?.type ===
        LogType.LIVE_INPUT_DESTROYED,
    },
  ];
  for (const log of event.logs) {
    const step = res.find((step) => step.id === log.type);
    if (step) {
      step.datetime = DateTime.fromMillis(log.timestamp).toISO() || undefined;
    }
  }
  return res;
};

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
  const [timelineSteps, setTimelineSteps] = useState<TimelineStepWithLog[]>(
    event ? getTimelineSteps(event) : []
  );

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
    console.log('event', event);
    if (event && event.logs) {
      setTimelineSteps(getTimelineSteps(event));
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
            <>
              {event?.status === 'TX' && (
                <>
                  {event?.endpoints.map((endpoint) => (
                    <CopyText
                      key={endpoint.url}
                      className={'w-full mb-2'}
                      text={endpoint.url}
                      icon={
                        <div className="badge badge-primary badge-outline flex items-center gap-2 w-[80px]">
                          <Link className="w-3 h-3" />
                          {endpoint.type}
                        </div>
                      }
                    />
                  ))}
                  <hr className={'my-6'} />
                </>
              )}
            </>
            <div className={'flex'}>
              <div className={'w-1/3 p-4'}>
                <Timeline steps={timelineSteps} />
              </div>
              <div className={'flex-grow w-1/2'}>
                {event?.endpoints &&
                event?.endpoints.length > 0 &&
                event?.logs.some(
                  (log) => log.type === LogType.LIVE_CHANNEL_STARTED
                ) &&
                event?.status === 'TX' ? (
                  <VideoPlayer
                    src={
                      event?.endpoints.find(
                        (endpoint) => endpoint.type === 'HLS'
                      )?.url || ''
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-base-200 rounded-lg p-4 shadow-inner text-base-content/40">
                    <SquarePlay className="w-12 h-12" />
                    <p>Player is not yet available</p>
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
