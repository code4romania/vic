export interface IFormatExceptionMessage {
  message: string;
  error_key?: unknown;
  code_error?: number;
}

export interface IException {
  badRequestException(data: IFormatExceptionMessage): void;
  internalServerErrorException(data?: IFormatExceptionMessage): void;
  forbiddenException(data?: IFormatExceptionMessage): void;
  unauthorizedException(data?: IFormatExceptionMessage): void;
  notFoundException(data?: IFormatExceptionMessage): void;
}
