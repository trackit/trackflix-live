export class EventDoesNotExistError extends Error {
  constructor() {
    super('Event does not exist');
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super('Action forbidden');
  }
}
