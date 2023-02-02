export interface IUseCaseService<T> {
  execute(...args: unknown[]): Promise<T> | Promise<void> | T | void;
}
