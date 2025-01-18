import { AfterEventCreated } from "./AfterEventCreated";
import { AfterEventDeleted } from "./AfterEventDeleted";
import { publishEventUseCase } from "../useCases/publishEvent";

import { eventRepository } from "../repositories";

new AfterEventCreated(publishEventUseCase, eventRepository);
new AfterEventDeleted();
