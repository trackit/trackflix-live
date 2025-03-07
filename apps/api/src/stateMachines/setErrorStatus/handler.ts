import { SetErrorStatusAdapter } from './setErrorStatus.adapter';
import { registerProductionInfrastructure } from '../../infrastructure/registerProductionInfrastructure';

registerProductionInfrastructure();

const adapter = new SetErrorStatusAdapter();

export const main = async (event: { eventId: string }): Promise<void> =>
  adapter.handle(event);
