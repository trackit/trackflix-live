import { UseCase } from "@shared/UseCase";
import { Event } from "../../domain/Event";
import { DomainEvents } from "@shared/DomainEvents";
import { EventMap } from "../../mappers/EventMap";
import { IEventRepository } from "../../repositories/eventRepository";
import { DeleteEventUseCaseRequestDto } from "./deleteEventDTO";

export class DeleteEventUseCase implements UseCase<DeleteEventUseCaseRequestDto, Event> {
    private eventRepository: IEventRepository;

    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    execute(request?: DeleteEventUseCaseRequestDto): Event | Promise<Event> {
        const event = EventMap.toDomain(request);

        this.eventRepository.deleteEventById(event.id);

        DomainEvents.dispatchEventsForAggregate(event.id)

        return event;
    }
}
