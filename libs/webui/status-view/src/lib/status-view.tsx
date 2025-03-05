import { useEffect, useState } from 'react';
import { Link, SquarePlay, X } from 'lucide-react';
import {
  Panel,
  Timeline,
  TxTimeline,
  TimelineStep,
  Step,
  VideoPlayer,
  StatusBadge,
} from '@trackflix-live/ui';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { deleteEvent, getEvent } from '@trackflix-live/api-client';
import { GetEventResponse, LogType, Event } from '@trackflix-live/types';
import { pubsub } from '@trackflix-live/api-client';
import { CopyText } from '@trackflix-live/ui';

const PRE_TX_TIME = 5;
const PLAYER_DELAY = 0;

type TimelineStepWithLog = TimelineStep & { id: LogType };

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
  const navigate = useNavigate();
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
  const [displayPlayer, setDisplayPlayer] = useState(false);
  const [displayLinks, setDisplayLinks] = useState(false);
  const [now, setNow] = useState<DateTime | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(event?.id || ''),
    onSuccess: () => {
      navigate('/');
    },
  });

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if the event can be deleted
  useEffect(() => {
    if (event?.status === 'PRE-TX' && now) {
      const preTxTime = DateTime.fromISO(event?.onAirStartTime || '')
        .minus({
          minutes: PRE_TX_TIME + 1,
        })
        .toMillis();
      setCanDelete(now.toMillis() < preTxTime);
    }
  }, [event, now]);

  // Display player when TX is started and there are endpoints
  useEffect(() => {
    if (
      event?.status === 'TX' &&
      event?.endpoints.length > 0 &&
      event?.logs.some((log) => log.type === LogType.LIVE_CHANNEL_STARTED)
    ) {
      setTimeout(() => {
        setDisplayPlayer(true);
      }, PLAYER_DELAY);
    } else {
      setDisplayPlayer(false);
    }
  }, [event]);

  // Display links when PRE-TX or TX is started and there are endpoints
  useEffect(() => {
    if (
      (event?.status === 'PRE-TX' || event?.status === 'TX') &&
      event?.endpoints.length > 0 &&
      event?.logs.some((log) => log.type === LogType.LIVE_CHANNEL_STARTED)
    ) {
      setDisplayLinks(true);
    } else {
      setDisplayLinks(false);
    }
  }, [event]);

  // On event update, update the Tx timeline steps
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

  // Subscribe to event updates
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

  // Delete event
  const handleDelete = async () => {
    if (event?.id) {
      await deleteMutation.mutateAsync();
    }
  };

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
          <div className="flex gap-2">
            {event?.status && <StatusBadge status={event.status} />}
            {canDelete && (
              <button
                className="btn  btn-outline btn-error"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Delete Event
              </button>
            )}
          </div>
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
            {displayLinks ? (
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
            ) : null}
            <div className={'flex'}>
              <div className={'w-1/3 p-4'}>
                <Timeline steps={timelineSteps} />
              </div>
              <div className={'flex-grow w-1/2'}>
                {displayPlayer ? (
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
                    <p>Player is not available</p>
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
