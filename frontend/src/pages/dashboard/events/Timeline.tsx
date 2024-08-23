import { DateTime } from 'luxon';
import { useEffect, useRef, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline as TimelineType, TimelineOptions as VisTimelineOptions } from 'vis-timeline';

interface TimelineItems {
  id: number;
  content: string;
  start: Date;
  end: Date;
}

interface TimelineProps {
  items: TimelineItems[];
  width?: string;
  height?: string;
}

const Timeline = ({ items, width = '100%', height = '600px' }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<TimelineType | null>(null);

  const memoizedItems = useMemo(() => new DataSet(items), [items]);

  const timelineOptions: VisTimelineOptions = {
    showCurrentTime: true,
    min: DateTime.local().minus({ days: 3 }).toJSDate(),
    max: DateTime.local().plus({ days: 3 }).toJSDate(),
    zoomMin: 1000 * 60 * 60 * 24,
    timeAxis: { scale: 'hour', step: 1 },
    height,
    width,
    format: {
      minorLabels: {
        minute: 'HH:mm',
        hour: 'HH:mm'
      },
      majorLabels: {
        day: 'MMM DD',
        month: 'MMMM YYYY',
        year: 'YYYY'
      }
    },
    orientation: 'top',
  };

  useEffect(() => {
    if (timelineRef.current && !timelineInstanceRef.current) {
      import('vis-timeline/standalone').then((module) => {
        const Timeline = module.Timeline;
        if (timelineRef.current) {
          timelineInstanceRef.current = new Timeline(
            timelineRef.current,
            memoizedItems,
            timelineOptions
          );
        }
      });
    } else if (timelineInstanceRef.current) {
      timelineInstanceRef.current.setItems(memoizedItems);
      timelineInstanceRef.current.setOptions(timelineOptions);
    }

    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [memoizedItems]);

  return <div ref={timelineRef} />;
};

export default Timeline;
