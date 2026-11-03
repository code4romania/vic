import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from 'src/api/_mobile/auth/dto/register.dto';
import { ResetPasswordWithCodeDto } from 'src/api/_mobile/auth/dto/reset-password-with-code.dto';
import { SocialLoginDto } from 'src/api/_mobile/auth/dto/social-login.dto';
import { ChangePasswordDto } from './change-password.dto';
import { LoginDto } from './login.dto';
import { SetPasswordDto } from './set-password.dto';

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

const TOKEN = 'A'.repeat(43);

describe('auth DTOs', () => {
  it('trims and lowercases emails', async () => {
    const { value, errors } = await check(LoginDto, {
      email: '  Ana@Example.RO ',
      password: 'anything',
    });

    expect(errors).toEqual([]);
    expect(value.email).toBe('ana@example.ro');
  });

  it('refuses a malformed email', async () => {
    const { errors } = await check(LoginDto, {
      email: 'not-an-email',
      password: 'x',
    });

    expect(errors).toEqual(['email']);
  });

  it('login accepts any password up to 256 characters, so old weak passwords simply fail AUTH_001', async () => {
    expect(
      (await check(LoginDto, { email: 'a@b.ro', password: 'weak' })).errors,
    ).toEqual([]);
    expect(
      (await check(LoginDto, { email: 'a@b.ro', password: 'x'.repeat(257) }))
        .errors,
    ).toEqual(['password']);
  });

  it.each(['password', 'PASSWORD', 'Pass1', `Aa1!${'a'.repeat(253)}`])(
    'a new password %p is refused',
    async (password) => {
      expect(
        (await check(SetPasswordDto, { token: TOKEN, password })).errors,
      ).toEqual(['password']);
      expect(
        (
          await check(ChangePasswordDto, {
            currentPassword: 'old',
            newPassword: password,
          })
        ).errors,
      ).toEqual(['newPassword']);
    },
  );

  it.each([
    ['too short', 'A'.repeat(42)],
    ['too long', 'A'.repeat(44)],
    ['not base64url', `${'A'.repeat(42)}+`],
  ])('a link token %s is refused', async (_, token) => {
    const { errors } = await check(SetPasswordDto, {
      token,
      password: 'Volunteer#2026',
    });

    expect(errors).toEqual(['token']);
  });

  it.each([
    ['five digits', '12345'],
    ['letters', '12a456'],
    // The pipe converts a JSON number to a string; a code sent as a number loses its leading zero.
    ['a leading zero lost by sending a number', 12345],
  ])('a code with %s is refused', async (_, code) => {
    const { errors } = await check(ResetPasswordWithCodeDto, {
      email: 'a@b.ro',
      code,
      password: 'Volunteer#2026',
    });

    expect(errors).toEqual(['code']);
  });

  it('a code keeps its leading zero', async () => {
    const { value, errors } = await check(ResetPasswordWithCodeDto, {
      email: 'a@b.ro',
      code: '012345',
      password: 'Volunteer#2026',
    });

    expect(errors).toEqual([]);
    expect(value.code).toBe('012345');
  });

  it('register needs a strong password and a phone', async () => {
    expect(
      (
        await check(RegisterDto, {
          email: 'Elena@Example.ro',
          password: 'Volunteer#2026',
          phone: '+40720000000',
        })
      ).errors,
    ).toEqual([]);
    expect(
      (
        await check(RegisterDto, { email: 'e@x.ro', password: 'weak' })
      ).errors.sort(),
    ).toEqual(['password', 'phone']);
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
