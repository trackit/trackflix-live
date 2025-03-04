export class EventDoesNotExistError extends Error {
  constructor() {
    super('Event does not exist');
  }
}
