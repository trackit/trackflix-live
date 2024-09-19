import { CreateEventController } from "./createEventController";
import { CreateEventUseCase } from "./createEventUseCase";
import { eventRepository } from "../../repositories";

const createEventUseCase = new CreateEventUseCase(eventRepository);
const createEventController = new CreateEventController(
  createEventUseCase
)

export {
  createEventUseCase,
  createEventController
}
