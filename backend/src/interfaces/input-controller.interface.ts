export interface InputControllerResponse {
    id: string;
    name: string;
}

export interface Input {
    id: string;
    name: string;
    type: string;
    state: string;
}

export interface InputController<T> {
    create(config: T): Promise<InputControllerResponse>;
    list(): Promise<Input[]>
    delete(id: string): Promise<boolean>;
}
