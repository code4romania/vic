export interface IError {
  message: string;
  code_error?: string;
  details?: unknown;
}

export interface IException {
  badRequestException(data: IError): void;
  internalServerErrorException(data?: IError): void;
  forbiddenException(data?: IError): void;
  unauthorizedException(data?: IError): void;
  notFoundException(data?: IError): void;
}
