export interface SourceControllerResponse {
    name: string;
    id: string;
}

export interface Source {
    id: string;
    name: string;
    status: string;
}

export interface SourceController<T> {
    create(name: string, config: T): Promise<SourceControllerResponse>;
    list(): Promise<Source[]>
    start(name: string): Promise<boolean>;
    stop(name: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}