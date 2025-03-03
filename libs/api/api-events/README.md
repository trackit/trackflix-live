# api-events

This library represents the core business logic related to Events.

## Ports

Ports are interfaces used by the use cases to interact with external infrastructures:  
They can represent external APIs, databases and other services.

| **Port**               | **Description**                                                                               |
|------------------------|-----------------------------------------------------------------------------------------------|
| EventScheduler         | Allows to execute code at a pre-defined later date and time.                                  |
| EventsRepository       | Allows to manipulate events in database.                                                      |
| EventUpdateSender      | Allows to send live updates related to events to the web application.                         |
| LiveChannelsManager    | Allows to manage live channels.                                                               |
| PackageChannelsManager | Allows to manage package channels.                                                            |
| TaskTokensRepository   | Allows to create and consume task tokens to resume workflows when notifications are received. |
| TransmissionsManager   | Allows to trigger and resume workflows.                                                       |


## Infrastructure

Fake and In-Memory implementations of the ports are provided in order to easily test the use cases.

## Use cases

Use cases represent the core business logic of the project. 

### AttachIotPolicy
This use case allows to attach an identity to the EventUpdateSender policy.

### CreateEvent
This use case:
- creates an event in database
- schedules the start transmission workflow
- schedules the stop transmission workflow
- sends a live update informing about the created event

### CreateLiveChannel
This use case:
- creates the live channel
- appends to the event's logs
- saves the resources identifiers in the database
- sends a live update informing about the updated event
- creates a task token to wait for the live channel creation

### CreatePackageChannel
This use case:
- creates the package channel and its endpoints
- saves the endpoints in the database
- appends to the event's logs
- sends a live update informing about the updated event

### DeleteLiveChannel
This use case:
- appends to the event's logs
- sends a live update informing about the updated event
- deletes the package channel and its endpoints
- creates a task token to wait for the live channel deletion

### DeleteLiveInput
This use case:
- appends to the event's logs
- sends a live update informing about the updated event
- deletes the live channel inputs

### DeletePackageChannel
This use case:
- deletes the package channel
- update the event's status to ENDED and destroyed time
- appends to the event's logs
- sends a live update informing about the updated event

### GetEvent
This use case:
- returns an event by id from the database

### HandleLiveChannelStateChange
This use case:
- consumes any task token that matches the resource identifier and expected state
- resumes any workflow tied to that task token

### ListEvents
This use case:
- returns a list of events from the database

### SaveResults
This use case:
- appends to the event's logs
- update the event's status to TX
- sends a live update informing about the updated event

### StartLiveChannel
This use case:
- appends to the event's logs
- sends a live update informing about the updated event
- starts the live channel
- creates a task token to resume the workflow when the live channel is started

### StartTransmission
This use case:
- starts a workflow to start the transmission of an event

### StopLiveChannel
This use case:
- update the event's status to POST-TX
- sends a live update informing about the updated event
- stops the live channel
- creates a task token to resume the workflow when the live channel is stopped

### StopTransmission
This use case:
- starts a workflow to stop the transmission of an event
