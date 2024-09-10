import {Handle} from "@shared/Handle";
import {EventCreatedEvent} from "../domain/events/eventCreatedEvent";
import {DomainEvents} from "@shared/DomainEvents";
import { IEventRepository } from "../repositories/eventRepository";

export class AfterEventCreated implements Handle<EventCreatedEvent> {
    private eventRepository: IEventRepository

    constructor() {
        this.setupSubscriptions();
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onEventCreatedEvent.bind(this), EventCreatedEvent.name)
    }

    private onEventCreatedEvent(event: EventCreatedEvent): void {
        // Get event from repository
        const eventFromRepository = this.eventRepository.getEventById(event.eventId);

        // Create resources on MediaLive

    }

}