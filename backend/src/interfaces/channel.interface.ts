import { BaseModel } from '@shared/base.interface';

export interface Channel extends BaseModel {
  state: string;
}

export interface ChannelInterface<T> {
  create(config: T): Promise<Channel>;
  list(): Promise<Channel[]>
  start(id: string): Promise<boolean>;
  stop(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
