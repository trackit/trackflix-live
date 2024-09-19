import { DeleteEventUseCase } from "./deleteEventUseCase";
import { eventRepository } from "../../repositories";
import { DeleteEventController } from "./deleteEventController";

const deleteEventUseCase = new DeleteEventUseCase(eventRepository);
const deleteEventController = new DeleteEventController(
  deleteEventUseCase
)

export {
  deleteEventUseCase,
  deleteEventController
}
