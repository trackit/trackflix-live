import { BaseModel } from '../shared/base.interface'

export interface PackagingConfiguration extends BaseModel {
    packagingGroupId: string,
}

export interface PackagingConfigurationController<T> {
    create(config: T): Promise<PackagingConfiguration>,
    list(): Promise<PackagingConfiguration[]>,
    delete(id: string): void,
}
