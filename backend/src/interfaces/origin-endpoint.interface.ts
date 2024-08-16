import { BaseModel } from '../shared/base.interface'

export interface OriginEndpoint extends BaseModel {
    channelId: string
}

export interface OriginEndpointInterface<T> {
    create(config: T): Promise<OriginEndpoint>,
    list(): Promise<OriginEndpoint[]>,
    delete(id: string): void,
}
