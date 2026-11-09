import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SocialLoginDto } from 'src/api/_mobile/auth/dto/social-login.dto';
import { ConfirmEmailDto } from './confirm-email.dto';
import { LoginWithCodeDto, RequestLoginDto } from './request-login.dto';

// The same options as the global ValidationPipe in setupApp.
async function check<T extends object>(
  dto: new () => T,
  plain: Record<string, unknown>,
): Promise<{ value: T; errors: string[] }> {
  const value = plainToInstance(dto, plain, {
    enableImplicitConversion: true,
  });
  const errors = await validate(value, { whitelist: true });
  return { value, errors: errors.map((error) => error.property) };
}

describe('auth DTOs (VIC 2.0, #514: no passwords)', () => {
  it('trims and lowercases emails', async () => {
    const { value, errors } = await check(RequestLoginDto, {
      email: '  Ana@Example.RO ',
    });

    expect(errors).toEqual([]);
    expect(value.email).toBe('ana@example.ro');
  });

  it('refuses a malformed email', async () => {
    const { errors } = await check(RequestLoginDto, { email: 'not-an-email' });

    expect(errors).toEqual(['email']);
  });

  it.each([
    ['too short', 'A'.repeat(42)],
    ['too long', 'A'.repeat(44)],
    ['not base64url', `${'A'.repeat(42)}+`],
  ])('a link token %s is refused', async (_, token) => {
    const { errors } = await check(ConfirmEmailDto, { token });

    expect(errors).toEqual(['token']);
  });

  it.each([
    ['five digits', '12345'],
    ['letters', '12a456'],
    // The pipe converts a JSON number to a string; a code sent as a number loses its leading zero.
    ['a leading zero lost by sending a number', 12345],
  ])('a code with %s is refused', async (_, code) => {
    const { errors } = await check(LoginWithCodeDto, {
      email: 'a@b.ro',
      code,
    });

    expect(errors).toEqual(['code']);
  });

  it('a code keeps its leading zero', async () => {
    const { value, errors } = await check(LoginWithCodeDto, {
      email: 'a@b.ro',
      code: '012345',
    });

    expect(errors).toEqual([]);
    expect(value.code).toBe('012345');
  });

  it('social login only accepts the three providers', async () => {
    expect(
      (await check(SocialLoginDto, { provider: 'apple', token: 't' })).errors,
    ).toEqual([]);
    expect(
      (await check(SocialLoginDto, { provider: 'twitter', token: 't' })).errors,
    ).toEqual(['provider']);
  });
});
