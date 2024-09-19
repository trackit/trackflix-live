import { eventRepository } from "../../repositories";
import { GetEventController } from "./getEventController";
import { GetEventUseCase } from "./getEventUseCase";

const getEventUseCase = new GetEventUseCase(eventRepository);
const getEventController = new GetEventController(
  getEventUseCase
)

export {
  getEventUseCase,
  getEventController
}
