import {UseCase} from "@shared/UseCase";
import {Source} from "../domain/Source";
import {Event} from "../domain/Event";
import {SourceProtocol} from "../enums/SourceProtocol";
import {DomainEvents} from "@shared/DomainEvents";

interface SourceRequestDto {
    name: string;
    protocol: string;
}

interface CreateEventUseCaseRequestDto {
    name: string;
    description: string;
    onAirStartTime: Date; // TODO: Should convert to a value object
    onAirEndTime: Date; // TODO: Should convert to a value object
    status: string;
    source: SourceRequestDto;
}

export class CreateEventUseCase implements UseCase<CreateEventUseCaseRequestDto, Event> {
    execute(request?: CreateEventUseCaseRequestDto): Event | Promise<Event> {
        const source = Source.create({
            name: request.source.name,
            protocol: SourceProtocol[request.source.protocol]
        })
        const event = Event.create({
            name: request.name,
            description: "",
            onAirEndTime: undefined,
            onAirStartTime: undefined,
            source: source,
            status: undefined
        })

        // .save()

        DomainEvents.dispatchEventsForAggregate(event.id)

        return event;
    }

}