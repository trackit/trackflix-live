import { EventsRepository } from '../../ports';
import { EventStatus } from '@trackflix-live/types';

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
    const event = await this.eventsRepository.getEvent(eventId);

    if (!event) {
      throw new Error('Event not found');
    }
    if (event.status !== EventStatus.PRE_TX) {
      throw new Error('Event cannot be deleted');
    }

    const currentDate = Date.now();
    const onAirStartTime = new Date(event.onAirStartTime);
    const onAirEndTime = new Date(event.onAirEndTime);
    if (
      currentDate >= onAirStartTime.getTime() &&
      currentDate <= onAirEndTime.getTime()
    ) {
      throw new Error('Cannot delete event while it is on air');
    }

    await this.eventsRepository.deleteEvent(eventId);
  }
}
