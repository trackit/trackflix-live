import { CreateEventUseCase } from "./createEventUseCase";
import { eventRepository } from "../../repositories";

const createEventUseCase = new CreateEventUseCase(eventRepository);

export {
  createEventUseCase,
}
