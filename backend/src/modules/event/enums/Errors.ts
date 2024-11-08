export enum Errors {
  SOURCE_NAME_MUST_BE_PROVIDED = "Source name must be provided",
  SOURCE_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG = "Source name must be at least 2 characters long",
  SOURCE_INVALID_PROTOCOL = "Invalid protocol specified",
  SOURCE_VALUES_MUST_BE_DEFINED = "The attributes name and protocol must be defined.",
  EVENT_NAME_MUST_BE_PROVIDED = "Event name must be provided",
  EVENT_NAME_MUST_BE_AT_LEAST_2_CHARACTERS_LONG = "Event name must be at least 2 characters long",
  EVENT_DESCRIPTION_MUST_BE_PROVIDED = "Event description must be provided",
  EVENT_MUST_HAVE_A_SOURCE = "Event must have a source",
  EVENT_MUST_HAVE_A_ONAIRSTARTTIME = "Event must have a onAirStartTime",
}
