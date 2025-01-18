import * as process from "node:process";
import { FakeEventRepository } from "./tests/fakeEventRepository";

const env = process.env.ENV;

// TODO: Implement repository
const eventRepository = env === "dev" ? new FakeEventRepository() : new FakeEventRepository();

export {
  eventRepository
}
