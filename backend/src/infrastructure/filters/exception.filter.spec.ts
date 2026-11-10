import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';
import { ExceptionsFilter } from './exception.filter';

describe('ExceptionsFilter', () => {
  const run = (
    exception: unknown,
  ): { status: jest.Mock; body: Record<string, unknown> } => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: (): unknown => ({ status }),
        getRequest: (): unknown => ({ url: '/x', path: '/x', method: 'GET' }),
      }),
    } as unknown as ArgumentsHost;
    new ExceptionsFilter().catch(exception, host);
    return { status, body: json.mock.calls[0][0] };
  };

  it('keeps message and code_error from an object response', () => {
    const { status, body } = run(
      new HttpException(
        { message: 'nope', code_error: 'AUTH_001' },
        HttpStatus.UNAUTHORIZED,
      ),
    );
    expect(status).toHaveBeenCalledWith(401);
    expect(body).toMatchObject({ message: 'nope', code_error: 'AUTH_001' });
  });

  it('wraps a string response instead of spreading its characters', () => {
    const { status, body } = run(
      new HttpException(
        'ThrottlerException: Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );
    expect(status).toHaveBeenCalledWith(429);
    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
        code_error: null,
      }),
    );
    expect(body).not.toHaveProperty('0');
  });

  const queryFailed = (code: string, message: string): QueryFailedError => {
    const driverError = Object.assign(new Error(message), {
      code,
      detail: 'Key (tax_id)=(RO123) already exists.',
    });
    return new QueryFailedError(
      'INSERT INTO organization ...',
      [],
      driverError,
    );
  };

  // Nothing about the error itself reaches the client: not its text, stack, SQL or the database's message.
  const expectNoDetail = (body: Record<string, unknown>): void => {
    const text = JSON.stringify(body);
    expect(body).not.toHaveProperty('stack');
    expect(text).not.toMatch(
      /stack|at Object|\.ts:\d|INSERT|tax_id|secret-detail/,
    );
  };

  it('a TypeError is a generic 500 with a code, without its message or stack', () => {
    const { status, body } = run(
      new TypeError(
        "Cannot read properties of undefined (reading 'secret-detail')",
      ),
    );
    expect(status).toHaveBeenCalledWith(500);
    expect(body).toMatchObject({
      statusCode: 500,
      message: 'Internal server error',
      code_error: 'INTERNAL_ERROR',
    });
    expectNoDetail(body);
  });

  it('any other error (a plain throw, a TypeORM error) is the same generic 500', () => {
    for (const error of [
      new Error('secret-detail'),
      new TypeORMError('secret-detail'),
      'secret-detail',
    ]) {
      const { status, body } = run(error);
      expect(status).toHaveBeenLastCalledWith(500);
      expect(body).toMatchObject({ code_error: 'INTERNAL_ERROR' });
      expectNoDetail(body);
    }
  });

  it('a unique violation is a 409 DUPLICATE_ENTRY, without the database message', () => {
    const { status, body } = run(
      queryFailed(
        '23505',
        'duplicate key value violates unique constraint "organization_tax_id_unique"',
      ),
    );
    expect(status).toHaveBeenCalledWith(409);
    expect(body).toMatchObject({ code_error: 'DUPLICATE_ENTRY' });
    expect(JSON.stringify(body)).not.toMatch(
      /duplicate key|organization_tax_id/,
    );
    expectNoDetail(body);
  });

  it('a malformed value (e.g. not a uuid) is a 400 INVALID_INPUT; an unknown database error a 500', () => {
    const invalid = run(
      queryFailed('22P02', 'invalid input syntax for type uuid: "x"'),
    );
    expect(invalid.status).toHaveBeenCalledWith(400);
    expect(invalid.body).toMatchObject({ code_error: 'INVALID_INPUT' });
    expectNoDetail(invalid.body);

    const unknown = run(
      queryFailed('42703', 'column "secret-detail" does not exist'),
    );
    expect(unknown.status).toHaveBeenCalledWith(500);
    expect(unknown.body).toMatchObject({ code_error: 'INTERNAL_ERROR' });
    expectNoDetail(unknown.body);
  });

  it('a missing entity is a 404 NOT_FOUND', () => {
    const { status, body } = run(new EntityNotFoundError('UserEntity', {}));
    expect(status).toHaveBeenCalledWith(404);
    expect(body).toMatchObject({ code_error: 'NOT_FOUND' });
  });

  it("multer's size limit (413) gets the FILE_TOO_LARGE code", () => {
    const { status, body } = run(
      new PayloadTooLargeException('File too large'),
    );
    expect(status).toHaveBeenCalledWith(413);
    expect(body).toMatchObject({ code_error: 'FILE_TOO_LARGE' });
  });
});
