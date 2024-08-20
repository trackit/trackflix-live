import { BaseModel } from '../shared/base.interface'

export interface HarvestJob extends BaseModel { }

export interface HarvestJobController<T> {
    create(config: T): Promise<HarvestJob>,
    list(): Promise<HarvestJob[]>
}
