import { Repository } from "@shared/Repository";
import { UniqueEntityID } from "@shared/UniqueEntityID";
import {Event} from "../domain/Event";

export interface IEventRepository extends Repository<Event> {
  getEventById (eventId: UniqueEntityID): Promise<Event>;
  deleteEventById (eventId: UniqueEntityID): Promise<void>;
  updateEventById (event: Event): Promise<void>;
}

export class EventRepository implements IEventRepository {
  updateEventById(event: Event): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getEventById(eventId: UniqueEntityID): Promise<Event> {
    throw new Error("Method not implemented.");
  }

  deleteEventById(eventId: UniqueEntityID): Promise<void> {
    throw new Error("Method not implemented.");
  }

  exists(t: Event): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  save(t: Event): Promise<Event> {
    throw new Error("Method not implemented.");
  }
}
