import { UseCase } from "@shared/UseCase";
import { Event } from "../../domain/Event";
import { DomainEvents } from "@shared/DomainEvents";
import { EventMap } from "../../mappers/EventMap";
import { IEventRepository } from "../../repositories/eventRepository";
import { CreateEventUseCaseRequestDto } from "./createEventDTO";
import { Result } from "@shared/Response";

export class CreateEventUseCase implements UseCase<CreateEventUseCaseRequestDto, Result<Event>> {
    private eventRepository: IEventRepository;

    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    async execute(request?: CreateEventUseCaseRequestDto): Promise<Result<Event>> {
        try {
            const event = EventMap.toDomain(request);

            await this.eventRepository.save(event)

            await DomainEvents.dispatchEventsForAggregate(event.id);

            return Result.ok<Event>(event);
        } catch (e) {
            return Result.fail<Event>(e.message);
        }
    }
}
