import { BaseModel } from '@shared/base.interface';

export interface Input extends BaseModel {
    type: string;
    state: string;
}

export interface InputController<T> {
    create(config: T): Promise<Input>;
    list(): Promise<Input[]>
    delete(id: string): Promise<boolean>;
}
