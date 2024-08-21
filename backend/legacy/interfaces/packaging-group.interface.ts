import { BaseModel } from '../shared/base.interface'

export interface PackagingGroup extends BaseModel { }

export interface PackagingGroupController<T> {
    create(config: T): Promise<PackagingGroup>,
    list(): Promise<PackagingGroup[]>,
    delete(id: string): void,
}
