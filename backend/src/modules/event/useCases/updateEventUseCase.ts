import {UseCase} from "@shared/UseCase";
import {Event} from "../domain/Event";
import {DomainEvents} from "@shared/DomainEvents";
import { EventMap } from "../mappers/EventMap";
import { IEventRepository } from "../repositories/eventRepository";

interface SourceRequestDto {
    name: string;
    protocol: string;
}

interface UpdateEventUseCaseRequestDto {
    name: string;
    description: string;
    onAirStartTime: Date;
    onAirEndTime: Date;
    status: string;
    source: SourceRequestDto;
}

export class UpdateEventUseCase implements UseCase<UpdateEventUseCaseRequestDto, Event> {
    private eventRepository: IEventRepository;

    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    execute(request?: UpdateEventUseCaseRequestDto): Event | Promise<Event> {
        const event = EventMap.toDomain(request);

        this.eventRepository.updateEventById(event);

        DomainEvents.dispatchEventsForAggregate(event.id)

        return event;
    }

}
