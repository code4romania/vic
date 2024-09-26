import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WithSentry } from '@sentry/nestjs';
import { Request, Response } from 'express';
import { IError } from 'src/common/exceptions/exceptions.interface';
import { JSONStringifyError } from 'src/common/helpers/utils';
import { TypeORMError } from 'typeorm';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  @WithSentry()
  catch(
    exception: HttpException | TypeORMError | TypeError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // define error message
    let message: IError;

    // set default status
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      // handle http exceptions
      status = exception.getStatus();
      message = exception.getResponse() as IError;
    } else if (exception instanceof TypeORMError) {
      // handle typeorm errors
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      message = {
        message: exception.message,
        code_error: null,
      };
    } else if (exception instanceof TypeError) {
      // handle type errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = {
        message: JSONStringifyError(exception),
        code_error: null,
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // build response data
    const responseData = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    };

    this.logMessage(request, message, status, exception);

    response.status(status).json(responseData);
  }

  private logMessage(
    request: Request,
    message: IError,
    status: number,
    exception: HttpException | TypeORMError | TypeError,
  ): void {
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `End Request for ${request.path} method=${
          request.method
        } status=${status} code_error=${
          message?.code_error ? message.code_error : null
        } message=${message?.message ? message.message : null}`,
        exception?.stack,
      );
    } else {
      this.logger.warn(
        `End Request for ${request.path} method=${
          request.method
        } status=${status} code_error=${
          message?.code_error ? message.code_error : null
        } message=${message?.message ? message.message : null}`,
      );
    }
  }
}
