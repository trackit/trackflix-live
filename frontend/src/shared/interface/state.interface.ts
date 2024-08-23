export interface AsyncState<T> extends State<T> {
  fetching: boolean;
}

export interface State<T> {
  data: T | null;
}
