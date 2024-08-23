import {Handle} from "@shared/Handle";
import {EventCreatedEvent} from "../domain/events/eventCreatedEvent";
import {DomainEvents} from "@shared/DomainEvents";

export class AfterEventCreated implements Handle<EventCreatedEvent> {
    constructor() {
        this.setupSubscriptions();
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onEventCreatedEvent.bind(this), EventCreatedEvent.name)
    }

    private onEventCreatedEvent() {
        // Create resources on MediaLive

    }

}