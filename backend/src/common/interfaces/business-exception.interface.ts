export interface BusinessException<T> {
  message: string;
  code_error: T;
}
