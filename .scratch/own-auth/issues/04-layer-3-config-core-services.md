# Layer 3 · Config, argon2, one-time tokens, sessions, rate limits, email builders, error codes

Status: ready-for-agent
Type: task
Blocked by: 03
Tracker card: B2 (part), B5 (part)

Building blocks only; no flow and no endpoint changes yet. Everything is unit-tested with mocked repositories.

## Checklist

- [ ] `npm i argon2 cookie-parser ioredis` and `npm i -D @types/cookie-parser`. `Dockerfile`: `node:20-alpine` in both stages (argon2 native build; matches `engines`).
- [ ] `src/infrastructure/config/environment-config.ts` adds (all required unless noted): `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (PEM, base64 one line), `JWT_KEY_ID`, `JWT_ACCESS_TTL_SECONDS` (number, 900), `REFRESH_TTL_DAYS_WEB` (7), `REFRESH_TTL_DAYS_MOBILE` (30), `AUTH_TOKEN_KEY`, `WEB_APP_URL`, `CORS_ORIGINS`, `MOBILE_MIN_VERSION`, `MAINTENANCE_MODE` (boolean string), `TURNSTILE_SECRET`, `GOOGLE_CLIENT_IDS`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `APPLE_BUNDLE_ID`, `MAIL_CONTACT`. Keep `COGNITO_*` and `ONG_HUB_API` until Layer 9. Update `.env.example`.
- [ ] `src/infrastructure/config/auth.config.ts`: `AuthConfigService` (decodes the PEMs, typed getters). `auth.module.ts`: `JwtModule.registerAsync` with RS256 private/public key and `keyid`.
- [ ] `src/infrastructure/providers/redis/`: ioredis client from `REDIS_HOST` / `REDIS_PORT`, global provider (the cache store is unused; Bull already pulls ioredis in).
- [ ] `src/modules/auth/services/password.service.ts`: `hash` (argon2id, memoryCost 19456, timeCost 2, parallelism 1), `verify`, `meetsPolicy` (PASSWORD_REGEX).
- [ ] `src/modules/auth/services/one-time-token.service.ts`: `issue({ identity, type, form, sentBy?, ttl? })` in one transaction (replace live tokens of that type, insert, return `{ secret, token }`); link = `randomBytes(32).toString('base64url')`, hash `HMAC-SHA256(AUTH_TOKEN_KEY, type + ':' + secret)`; code = 6 digits, hash over `identityId + ':' + type + ':' + code`; lifetimes verify_email 24 h, reset_password link 1 h / code 15 min, invite 14 days (30 from the migration script); `peekLink`, `verifyCode` (`timingSafeEqual`; fifth wrong attempt sets `replacedAt`), `consume(token, manager)` (a reset or invite consumed also replaces every other live reset_password and invite row), `maskEmail`.
- [ ] `src/modules/auth/services/session.service.ts`: `signAccessToken(identity, realm)` (`sub`, `aud` vic-web / vic-mobile, `iss` vic-api, `keyid`), `createSession(identity, realm, { userAgent, ip })`, `rotate(secret, realm)` (hash → previous_hash; previous_hash hit within 10 s returns the current pair; later → revoke and throw AUTH_008), `revoke`, `revokeAll(identityId, exceptSessionId?)`.
- [ ] `src/modules/auth/services/auth-rate-limit.service.ts`: INCR + EXPIRE on `auth:issue:<identityId>:<type>:<minute|hour>`; one a minute and five an hour per identity and type; Send invite one per 10 min and five a day per target; over → AUTH_010.
- [ ] `src/modules/auth/constants/auth-emails.ts` + `src/modules/auth/services/auth-mailer.service.ts`: builders `transitionLinkAdmin`, `transitionLinkVolunteer`, `resetLink`, `resetCode`, `inviteLink(url, organizationName, invitedBy)`, `verifyEmailLink`, `confirmOrganizationLink`, `organizationRegistered`, `organizationValidated`, `passwordChanged`; Romanian with English below (pattern `src/common/constants/notifications.ts`); links `WEB_APP_URL/set-password?token=` and `/confirm-email?token=`; every context passes `cta` and `code` explicitly (`null` when absent) because Handlebars runs with `strict: true`.
- [ ] `src/modules/auth/exceptions/exceptions.ts`: AUTH_001 invalid credentials 401 · 002 locked 423 · 003 email not confirmed 403 · 004 disabled 403 · 005 token invalid, expired or used 400 · 006 too many wrong codes 400 · 007 weak password 400 · 008 refresh invalid or reused 401 · 009 email already registered 409 · 010 too many requests 429 · 011 app version too old 426 · 012 volunteer account on the web login 409 · 013 social token invalid or email not verified 401. `ORG_005` "Organization not validated" 403 in `src/modules/organization/exceptions/exceptions.ts`.
- [ ] Start `backend/docs/auth.md`: env vars, key generation (`openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048`, `openssl rsa -pubout`, `openssl rand -base64 32`), the error-code table.
- [ ] Specs: `password.service.spec` (round trip, wrong password, policy cases), `one-time-token.service.spec` (43-char link, 6-digit code with leading zeros, issue replaces, peek rejects unknown/expired/used/replaced, hash changes with the key, code for another identity fails, fifth wrong attempt ends the row, consuming a reset kills the live invite), `session.service.spec` (rotate, replay after 11 s revokes and throws AUTH_008, 3 s returns the current pair, revokeAll, expired refused), `auth-rate-limit.service.spec` (ioredis mocked: sixth in an hour → AUTH_010, keys expire), `auth-emails.spec` (subject, link or code present, links start with `WEB_APP_URL`, admin transition mentions the Team page, `mail-template.hbs` renders once with a builder's context under strict mode).

## Done when

Build, lint, test pass; the app still boots locally with the new env vars present.

## Comments
