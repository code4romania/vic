import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IError } from 'src/common/exceptions/exceptions.interface';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

// The answers for errors that are not the API's own (HttpException): a generic message and a code, never the
// error's text, stack or the database's message. The details go to the log.
export const GENERIC_ERRORS = {
  INTERNAL_ERROR: {
    message: 'Internal server error',
    code_error: 'INTERNAL_ERROR',
  },
  DUPLICATE_ENTRY: {
    message: 'A record with the same data already exists',
    code_error: 'DUPLICATE_ENTRY',
  },
  CONFLICT: {
    message: 'The record is still in use or refers to a missing record',
    code_error: 'CONFLICT',
  },
  INVALID_INPUT: {
    message: 'Invalid input',
    code_error: 'INVALID_INPUT',
  },
  NOT_FOUND: {
    message: 'Not found',
    code_error: 'NOT_FOUND',
  },
  FILE_TOO_LARGE: {
    message: 'File too large',
    code_error: 'FILE_TOO_LARGE',
  },
} satisfies Record<string, IError>;

// Postgres error codes (SQLSTATE) a client's request can cause; any other is a server error.
const PG_ERRORS: Record<string, { status: HttpStatus; body: IError }> = {
  '23505': {
    status: HttpStatus.CONFLICT,
    body: GENERIC_ERRORS.DUPLICATE_ENTRY,
  }, // unique_violation
  '23503': { status: HttpStatus.CONFLICT, body: GENERIC_ERRORS.CONFLICT }, // foreign_key_violation
  '22P02': {
    status: HttpStatus.BAD_REQUEST,
    body: GENERIC_ERRORS.INVALID_INPUT,
  }, // invalid_text_representation
  '22001': {
    status: HttpStatus.BAD_REQUEST,
    body: GENERIC_ERRORS.INVALID_INPUT,
  }, // string_data_right_truncation
  '22003': {
    status: HttpStatus.BAD_REQUEST,
    body: GENERIC_ERRORS.INVALID_INPUT,
  }, // numeric_value_out_of_range
  '22007': {
    status: HttpStatus.BAD_REQUEST,
    body: GENERIC_ERRORS.INVALID_INPUT,
  }, // invalid_datetime_format
  '22008': {
    status: HttpStatus.BAD_REQUEST,
    body: GENERIC_ERRORS.INVALID_INPUT,
  }, // datetime_field_overflow
};

// The Postgres error code of a failed query, or undefined.
export function postgresErrorCode(exception: unknown): string {
  if (!(exception instanceof QueryFailedError)) return undefined;
  const driverError = (
    exception as QueryFailedError & {
      driverError?: { code?: string };
    }
  ).driverError;
  return driverError?.code ?? (exception as unknown as { code?: string }).code;
}

// A unique index refused the row: e.g. two registrations with the same CUI at the same moment.
export function isUniqueViolation(exception: unknown): boolean {
  return postgresErrorCode(exception) === '23505';
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.toResponse(exception);

    const responseData = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...message,
    };

    this.logMessage(request, message, status, exception);

    response.status(status).json(responseData);
  }

  private toResponse(exception: unknown): {
    status: number;
    message: IError;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      // Some exceptions answer a plain string (e.g. the throttler's 429); spreading it below would
      // turn it into { "0": "T", "1": "h", ... }.
      let message: IError =
        typeof body === 'string'
          ? { message: body, code_error: null }
          : (body as IError);
      // Multer's size limit (FileInterceptor limits.fileSize) answers 413 without a code.
      if (
        exception instanceof PayloadTooLargeException &&
        !message?.code_error
      ) {
        message = GENERIC_ERRORS.FILE_TOO_LARGE;
      }
      return { status, message };
    }

    if (exception instanceof EntityNotFoundError) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: GENERIC_ERRORS.NOT_FOUND,
      };
    }

    const known = PG_ERRORS[postgresErrorCode(exception)];
    if (known) {
      return { status: known.status, message: known.body };
    }

    // Anything else (a TypeError, any other database error) is ours: no detail to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: GENERIC_ERRORS.INTERNAL_ERROR,
    };
  }

  private logMessage(
    request: Request,
    message: IError,
    status: number,
    exception: unknown,
  ): void {
    const summary = `End Request for ${request.path} method=${
      request.method
    } status=${status} code_error=${
      message?.code_error ? message.code_error : null
    } message=${message?.message ? message.message : null}`;

    if (exception instanceof HttpException) {
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(summary, exception.stack);
      } else {
        this.logger.warn(summary);
      }
      return;
    }

    // Not the API's own error: the real message (and the database's detail) stays in the log.
    const error = exception as Error & { detail?: string; code?: string };
    const cause = `cause=${error?.name}: ${error?.message}${
      error?.detail ? ` detail=${error.detail}` : ''
    }`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${summary} ${cause}`, error?.stack);
    } else {
      this.logger.warn(`${summary} ${cause}`);
    }
  }
}
