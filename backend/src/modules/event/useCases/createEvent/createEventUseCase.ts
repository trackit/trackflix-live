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
            const eventDomain = EventMap.toDomain(request);
            const event = Event.create(eventDomain);
            if (!event.isSuccess)
                return Result.fail<Event>(event.errorValue());

            const eventValue = event.getValue();

            await this.eventRepository.save(eventValue)

            DomainEvents.dispatchEventsForAggregate(eventValue.id);

            return Result.ok<Event>(eventValue);
        } catch (e) {
            return Result.fail<Event>(e.message);
        }
    }
}
