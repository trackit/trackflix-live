import { eventRepository } from "../../repositories";
import { UpdateEventController } from "./updateEventController";
import { UpdateEventUseCase } from "./updateEventUseCase";

const updateEventUseCase = new UpdateEventUseCase(eventRepository);
const updateEventController = new UpdateEventController(
  updateEventUseCase
)

export {
  updateEventUseCase,
  updateEventController
}
