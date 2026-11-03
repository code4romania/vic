import { ExecutionContext } from '@nestjs/common';
import { SuperAdminGuard } from 'src/modules/auth/guards/super-admin.guard';
import { AuthExceptionCodes } from 'src/modules/auth/exceptions/exceptions';
import { createTestAuthConfig } from '../../../test/utils/auth-test-config';
import { MobileVersionGuard } from './mobile-version.guard';

const httpContext = (request: Record<string, unknown>): ExecutionContext =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const mobileRequest = (
  path: string,
  version?: string,
): Record<string, unknown> => ({
  path,
  header: (name: string) =>
    name.toLowerCase() === 'x-app-version' ? version : undefined,
});

describe('MobileVersionGuard', () => {
  const guard = new MobileVersionGuard(
    createTestAuthConfig({ MOBILE_MIN_VERSION: '1.1.0' }),
  );

  it('answers 426 AUTH_011 below the minimum version', () => {
    expect(() =>
      guard.canActivate(httpContext(mobileRequest('/mobile/user', '1.0.19'))),
    ).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({
          code_error: AuthExceptionCodes.AUTH_011,
        }),
        status: 426,
      }),
    );
  });

  it.each([
    ['the same version', '/mobile/user', '1.1.0'],
    ['a newer version', '/mobile/user', '1.2.3'],
    [
      'no header (old builds fail on their token instead)',
      '/mobile/user',
      undefined,
    ],
    ['a non-mobile path', '/organization', '1.0.0'],
  ])('passes %s', (_, path, version) => {
    expect(guard.canActivate(httpContext(mobileRequest(path, version)))).toBe(
      true,
    );
  });

  it('ignores non-http contexts', () => {
    const context = { getType: () => 'rpc' } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});

describe('SuperAdminGuard', () => {
  const guard = new SuperAdminGuard();

  it.each([
    [true, { superAdmin: true }],
    [false, { superAdmin: false }],
    [false, { superAdmin: 'true' }],
    [false, undefined],
  ])('returns %p for user %p', (expected, user) => {
    expect(guard.canActivate(httpContext({ user }))).toBe(expected);
  });
});
