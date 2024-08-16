import { BaseModel } from '../shared/base.interface'

export interface HarvestJob extends BaseModel { }

export interface HarvestJobInterface<T> {
    create(config: T): Promise<HarvestJob>,
    list(): Promise<HarvestJob[]>
}
