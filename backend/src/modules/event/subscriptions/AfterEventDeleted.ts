import {Handle} from "@shared/Handle";
import {DomainEvents} from "@shared/DomainEvents";
import { IEventRepository } from "../repositories/eventRepository";
import { EventDeletedEvent } from "../domain/events/eventDeletedEvent";

export class AfterEventDeleted implements Handle<EventDeletedEvent> {
    private eventRepository: IEventRepository

    constructor() {
        this.setupSubscriptions();
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onEventDeletedEvent.bind(this), EventDeletedEvent.name)
    }

    private onEventDeletedEvent(event: EventDeletedEvent): void {
        // Get event from repository
        const eventFromRepository = this.eventRepository.getEventById(event.eventId);

        // Delete resources on MediaLive

    }
}
