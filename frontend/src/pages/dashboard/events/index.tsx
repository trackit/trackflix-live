import Timeline from "@/components/Timeline";
import { Event } from "@/shared/interface/event.interface";
import { AsyncState } from "@/shared/interface/state.interface";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { getEvents } from "@/shared/api/events";
import { getSources } from "@/shared/api/source";
import { Source } from "@/shared/interface/source.interface";

export default function Events() {
  const [itemsState, setItemsState] = useState<AsyncState<Event[]>>({
    data: [],
    fetching: true,
  });

  const [sourcesState, setSourcesState] = useState<AsyncState<Source[]>>({
    data: [],
    fetching: true,
  });

  const [pageHeight, setPageHeight] = useState(0);


  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getEvents({});
      const sources = await getSources({})
      setItemsState({ data: events.events, fetching: false });
      setSourcesState({ data: sources.sources, fetching: false });
    }

    const updatePageHeight = () => {
      setPageHeight(document.documentElement.scrollHeight);
    };

    updatePageHeight();

    window.addEventListener('resize', updatePageHeight);

    fetchEvents();

    return () => {
      window.removeEventListener('resize', updatePageHeight);
    };
  }, []);

  return (
    itemsState.fetching ? <Loader /> :
      <Timeline items={itemsState.data} sources={sourcesState.data} height={`${pageHeight - 20}px`}/>
  );
}
