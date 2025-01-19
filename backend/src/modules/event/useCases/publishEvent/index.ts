import { PublishEventUseCase } from './publishEventUseCase';
import { EventBridgeService } from "../../services/eventManager/EventBridgeService";
import * as process from "node:process";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";

const eventService = new EventBridgeService(new EventBridgeClient({
    region: 'us-west-2'
}));

// TODO: Implement fake client
const eventManager = process.env.ENV === "dev" ? eventService : eventService;

const publishEventUseCase = new PublishEventUseCase(eventManager);

export {
    publishEventUseCase
};
