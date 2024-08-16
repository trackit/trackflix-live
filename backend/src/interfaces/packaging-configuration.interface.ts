import { BaseModel } from '../shared/base.interface'

export interface PackagingConfiguration extends BaseModel {
    packagingGroupId: string,
}

export interface PackagingConfigurationInterface<T> {
    create(config: T): Promise<PackagingConfiguration>,
    list(): Promise<PackagingConfiguration[]>,
    delete(id: string): void,
}
