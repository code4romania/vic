import { CookieOptions, Response } from 'express';
import { AuthConfigService } from 'src/infrastructure/config/auth.config';
import { AuthRealm } from 'src/modules/auth/enums/auth.enums';

export const REFRESH_COOKIE = 'vic_refresh';

// Only sent to /auth/web (refresh and logout). API and web app share the registrable domain, so Lax is enough.
const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'local',
  sameSite: 'lax',
  path: '/auth/web',
});

export function setRefreshCookie(
  res: Response,
  secret: string,
  authConfig: AuthConfigService,
): void {
  res.cookie(REFRESH_COOKIE, secret, {
    ...cookieOptions(),
    maxAge: authConfig.refreshTtlDays(AuthRealm.WEB) * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}
