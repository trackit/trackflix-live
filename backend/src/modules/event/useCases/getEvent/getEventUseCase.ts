import { UseCase } from "@shared/UseCase";
import { Event } from "../../domain/Event";
import { DomainEvents } from "@shared/DomainEvents";
import { EventMap } from "../../mappers/EventMap";
import { IEventRepository } from "../../repositories/eventRepository";
import { GetEventUseCaseRequestDto } from "./getEventDTO";

export class GetEventUseCase implements UseCase<GetEventUseCaseRequestDto, Event> {
    private eventRepository: IEventRepository;

    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    execute(request?: GetEventUseCaseRequestDto): Event | Promise<Event> {
        const event = EventMap.toDomain(request);

        this.eventRepository.getEventById(event.id);

        DomainEvents.dispatchEventsForAggregate(event.id)

        return event;
    }
}
