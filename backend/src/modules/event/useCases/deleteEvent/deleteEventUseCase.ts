import { UseCase } from "@shared/UseCase";
import { Event } from "../../domain/Event";
import { DomainEvents } from "@shared/DomainEvents";
import { EventMap } from "../../mappers/EventMap";
import { IEventRepository } from "../../repositories/eventRepository";
import { DeleteEventUseCaseRequestDto } from "./deleteEventDTO";
import {Result} from "@shared/Response";

export class DeleteEventUseCase implements UseCase<DeleteEventUseCaseRequestDto, Result<Event>> {
    private eventRepository: IEventRepository;

    constructor(eventRepository: IEventRepository) {
        this.eventRepository = eventRepository;
    }

    async execute(request?: DeleteEventUseCaseRequestDto): Promise<Result<Event>> {
        try {
            const event = EventMap.toDomain(request);

            await this.eventRepository.deleteEventById(event.id);

            DomainEvents.dispatchEventsForAggregate(event.id)

            return Result.ok<Event>(event);
        } catch (e) {
            return Result.fail<Event>(e.message);
        }
    }
}
