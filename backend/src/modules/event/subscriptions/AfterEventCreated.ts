import {Handle} from "@shared/Handle";
import {EventCreatedEvent} from "../domain/events/eventCreatedEvent";
import {DomainEvents} from "@shared/DomainEvents";
import { PublishEventUseCase } from "../useCases/publishEvent/publishEventUseCase";
import { IEventRepository } from "../repositories/eventRepository";

export class AfterEventCreated implements Handle<EventCreatedEvent> {
    private _publishEventUseCase: PublishEventUseCase;

    private _eventRepository: IEventRepository;

    constructor(publishEventUseCase: PublishEventUseCase, eventRepository: IEventRepository) {
        this.setupSubscriptions();

        this._publishEventUseCase = publishEventUseCase;
        this._eventRepository = eventRepository;
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onEventCreatedEvent.bind(this), EventCreatedEvent.name)
    }

    private async onEventCreatedEvent(event: EventCreatedEvent): Promise<void> {
        const { eventId } = event;


        const eventFromRepo = await this._eventRepository.getEventById(eventId);

        if (eventFromRepo === null) {
            throw new Error('Event not found');
        }

        const publishEventResponse = await this._publishEventUseCase.execute(eventFromRepo);
        if (publishEventResponse.isFailure) {
            throw new Error(publishEventResponse.errorValue());
        }
    }
}
