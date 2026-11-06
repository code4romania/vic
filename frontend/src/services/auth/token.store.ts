// The access token lives in memory only, never in localStorage: a reload gets a new one from the
// httpOnly vic_refresh cookie (POST /auth/web/refresh).
let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};
