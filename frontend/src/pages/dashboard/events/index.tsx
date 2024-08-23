import Timeline from "@/components/Timeline";
import { Event } from "@/shared/interface/event.interface";
import { AsyncState } from "@/shared/interface/state.interface";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { getEvents } from "@/shared/api/events";

export default function Events() {
  const [itemsState, setItemsState] = useState<AsyncState<Event[]>>({
    data: [],
    fetching: true,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents({});
      setItemsState({ data: data.events, fetching: false });
    }

    fetchEvents();
  }, []);

  return (
    itemsState.fetching ? <Loader /> :
      <Timeline items={itemsState.data} />
  );
}
