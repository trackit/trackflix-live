import { BaseModel } from "@shared/base.interface";

export interface Source extends BaseModel {
    status: string;
}

export interface SourceController<T> {
    create(name: string, config: T): Promise<Source>;
    list(): Promise<Source[]>
    start(name: string): Promise<boolean>;
    stop(name: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}