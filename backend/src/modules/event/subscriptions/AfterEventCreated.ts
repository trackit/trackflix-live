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

    // TODO -> Get event from repository and push event
    private onEventCreatedEvent(event: EventCreatedEvent): void {
        // console.log('after event created');
        // const eventFromRepository = this.eventRepository.getEventById(event.eventId);
    }
}
