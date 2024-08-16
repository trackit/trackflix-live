import { BaseModel } from '../shared/base.interface'

export interface PackagingGroup extends BaseModel { }

export interface PackagingGroupInterface<T> {
    create(config: T): Promise<PackagingGroup>,
    list(): Promise<PackagingGroup[]>,
    delete(id: string): void,
}
