import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionsFilter } from './exception.filter';

describe('ExceptionsFilter', () => {
  const run = (
    exception: HttpException,
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
});
