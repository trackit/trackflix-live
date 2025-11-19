import { singletonFactory } from './singleton';
import { IotService } from './iot-service';
import { IotServiceApi } from './iot-service.api';

export const iotServiceSingleton = singletonFactory<IotService>({
  factory: () =>
    new IotServiceApi({
      baseURL: import.meta.env.VITE_API_URL || '',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
});
