import { UpdateStatusAdapter } from './updateStatus.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new UpdateStatusAdapter();

export const main = async (event: { eventId: string }): Promise<void> =>
  adapter.handle(event);
