export enum AUTH_STRATEGIES {
  MOBILE = 'mobile-jwt',
  WEB = 'web-jwt',
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// How long an emailed secret stays valid.
export const AUTH_TOKEN_TTL_MS = {
  VERIFY_EMAIL_LINK: 24 * HOUR_MS,
  LOGIN_LINK: 15 * MINUTE_MS,
  LOGIN_CODE: 15 * MINUTE_MS,
  INVITE_LINK: 14 * DAY_MS, // Team page
  TRANSITION_LINK: 30 * DAY_MS, // the invite the cutover script sends
  SENSITIVE_CODE: 10 * MINUTE_MS, // #508
};

// A wrong code counts an attempt; the fifth ends the code.
export const AUTH_CODE_MAX_ATTEMPTS = 5;

// A refresh token presented again within this window after its rotation is two tabs or requests crossing, not a replay.
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;
