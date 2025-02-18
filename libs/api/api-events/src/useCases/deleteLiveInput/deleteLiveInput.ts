import { EventsRepository, LiveChannelsManager } from '../../ports';

export interface DeleteLiveInputParameters {
  eventId: string;
}

export interface DeleteLiveInputUseCase {
  deleteLiveInput(params: DeleteLiveInputParameters): Promise<void>;
}

export class DeleteLiveInputUseCaseImpl implements DeleteLiveInputUseCase {
  private readonly liveChannelsManager: LiveChannelsManager;

  private readonly eventsRepository: EventsRepository;

  public constructor({
    liveChannelsManager,
    eventsRepository,
  }: {
    liveChannelsManager: LiveChannelsManager;
    eventsRepository: EventsRepository;
  }) {
    this.liveChannelsManager = liveChannelsManager;
    this.eventsRepository = eventsRepository;
  }

  public async deleteLiveInput({
    eventId,
  }: DeleteLiveInputParameters): Promise<void> {
    const event = await this.eventsRepository.getEvent(eventId);
    if (event === undefined) {
      throw new Error('Event not found.');
    }
    if (event.liveInputId === undefined) {
      throw new Error('Missing live input ID.');
    }

    const { liveInputId } = event;

    await this.liveChannelsManager.deleteInput(liveInputId);
  }
}
