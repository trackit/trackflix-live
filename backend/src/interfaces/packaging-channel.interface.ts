import { BaseModel } from '../shared/base.interface'

export interface PackagingChannel extends BaseModel { }

export interface PackagingChannelInterface {
    create(id: string): Promise<PackagingChannel>,
    list(): Promise<PackagingChannel[]>,
    delete(id: string): void,
}
