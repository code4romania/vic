export interface IBusinessError {
  message: string;
  code_error?: string;
}

export interface IException {
  badRequestException(data: IBusinessError): void;
  internalServerErrorException(data?: IBusinessError): void;
  forbiddenException(data?: IBusinessError): void;
  unauthorizedException(data?: IBusinessError): void;
  notFoundException(data?: IBusinessError): void;
}

export interface IError<T> {
  error: string;
  businessError: IBusinessError;
  data:
    | T
    | {
        [x: string | number | symbol]: unknown;
      };
}
