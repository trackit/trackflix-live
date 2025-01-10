import { Event } from '@/shared/interface/event.interface';
import { DateTime } from 'luxon';
import { useEffect, useRef, useMemo } from 'react';
import { DataSet } from 'vis-data';
import { Timeline as TimelineType, TimelineOptions as VisTimelineOptions } from 'vis-timeline';
import colors from '@/styles/colors';
import { Source } from "@/shared/interface/source.interface";

interface TimelineProps {
  items: Event[];
  sources: Source[];
  width?: string;
  height?: string;
}

const assignItemColor = (items: Event[], sources: Source[]) => items.map((item) => ({
  ...item,
  group: sources.find((source) => source.content === item.source)?.id,
  style: `background-color: ${colors.red.light}; color: #000000; border-color: #f87171;`,
}));

const Timeline = ({ sources, items, width = '100%', height = '100%' }: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<TimelineType | null>(null);

  const memoizedItems = useMemo(() => new DataSet(assignItemColor(items, sources)), [items]);
  const groups = useMemo(() => new DataSet(sources), [sources])

  memoizedItems.map((item) => console.log(item));

  const timelineOptions: VisTimelineOptions = {
    showCurrentTime: true,
    min: DateTime.local().minus({ days: 3 }).toJSDate(),
    max: DateTime.local().plus({ days: 3 }).toJSDate(),
    zoomMin: 1000 * 60 * 60 * 5,
    minHeight: height,
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
    selectable: false,
  };

  useEffect(() => {
    if (timelineRef.current && !timelineInstanceRef.current) {
      import('vis-timeline/standalone').then((module) => {
        const Timeline = module.Timeline;
        if (timelineRef.current) {
          timelineInstanceRef.current = new Timeline(
            timelineRef.current,
            memoizedItems,
            groups,
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
