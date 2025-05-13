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

export class CreateMediaLiveChannelError extends Error {
  constructor() {
    super('Error creating MediaLive Channel');
  }
}
