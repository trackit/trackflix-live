import { EventsRepository } from '../../ports';

export interface DeleteEventUseCase {
  deleteEvent(eventId: string): Promise<void>;
}

export class DeleteEventUseCaseImpl implements DeleteEventUseCase {
  private readonly eventsRepository: EventsRepository;

  public constructor({
    eventsRepository,
  }: {
    eventsRepository: EventsRepository;
  }) {
    this.eventsRepository = eventsRepository;
  }

  public async deleteEvent(eventId: string): Promise<void> {
    await this.eventsRepository.deleteEvent(eventId);
  }
}
