import {UseCase} from "@shared/UseCase";
import {Event} from "../domain/Event";
import {DomainEvents} from "@shared/DomainEvents";
import { EventMap } from "../mappers/EventMap";
import { IEventRepository } from "../repositories/eventRepository";

interface SourceRequestDto {
    name: string;
    protocol: string;
}

interface GetEventUseCaseRequestDto {
    name: string;
    description: string;
    onAirStartTime: Date;
    onAirEndTime: Date;
    status: string;
    source: SourceRequestDto;
}

export class CreateEventUseCase implements UseCase<GetEventUseCaseRequestDto, Event> {
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
