export interface ChannelControllerResponse {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
  state: string;
}

export interface ChannelController<T> {
  create(config: T): Promise<ChannelControllerResponse>;
  list(): Promise<Channel[]>
  start(id: string): Promise<boolean>;
  stop(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
