# Authentication in the VIC backend

How login works once Cognito and NGO Hub are replaced. Written 16 October 2026 from the design; sections are confirmed or corrected as each layer lands (Layers 1 to 3 checked against the code on 30 October 2026) (`.scratch/own-auth/issues/`). The full step-by-step is in the Implementation Guide (https://claude.ai/code/artifact/02645619-109a-4538-9358-b61ffb680134); the reasons are in the design doc (https://claude.ai/code/artifact/db39a7ad-1dd1-4ea4-b50f-ebc22ada9a7e). Decisions taken after the design (resolutions R1 to R36) are in `.scratch/own-auth/decisions.md`, which wins where the documents differ; this page follows it.

## Overview

The backend checks email and password itself and issues its own tokens through `@nestjs/passport`. The two JWT strategies keep their names (`AUTH_STRATEGIES.WEB`, `AUTH_STRATEGIES.MOBILE`) and still put the same user object on `request.user`, so controllers do not change. They also add `identityId` and `sessionId` (from the `sid` claim), which change-password uses to keep the current session. Web tokens and mobile tokens carry a different audience, so a volunteer's token can never open admin pages.

- Access token: RS256 JWT, 15 minutes, `sub` = identity id, `sid` = the `refresh_token` row id (the session), `aud` = `vic-web` or `vic-mobile`, `iss` = `vic-api`, `kid` for key rotation.
- Refresh token: 32 random bytes, rotated on every use; 7 days on the web in the `vic_refresh` httpOnly cookie (path `/auth/web`), 30 days on mobile in secure storage. Stored as SHA-256.
- Passwords: argon2id (`memoryCost 19456, timeCost 2, parallelism 1`). Rule: 8 to 256 characters with upper case, lower case, a digit and a symbol (`PASSWORD_REGEX` in `src/common/constants/constants.ts`).
- A request is accepted only while the identity is `active`: a disabled identity's tokens, access and refresh, are rejected on its next request. A web admin whose organization is `suspended` is refused at login and by the web strategy (AUTH_004); suspending does not change identity status, so unsuspending restores exactly the admins who were active.
- Super admin routes use `SuperAdminGuard` after the JWT guard. The global `RolesGuard` runs before the controller JWT guards, so `@Roles` cannot be used on these routes.
- Every emailed secret is a link, except Forgot password started in the mobile app (a 6-digit code). The login endpoint never sends email.

## Tables

| Table | Holds | Main columns |
|---|---|---|
| `auth_identity` | one login per email per realm | realm, email, password_hash, status (pending_password / active / disabled), super_admin, email_verified_at, password_set_at, last_login_at, failed_attempts, locked_until, legacy_cognito_username, user_id |
| `auth_token` | one-time links and codes | identity_id, type (verify_email / reset_password / invite), form (link / code), token_hash, expires_at, used_at, replaced_at, attempts, sent_to, sent_by |
| `refresh_token` | one row per logged-in browser or phone | identity_id, token_hash, previous_hash, rotated_at, expires_at, revoked_at, last_used_at, user_agent, ip |
| `auth_identity_provider` | a Google / Facebook / Apple account linked to a mobile login | identity_id, provider, subject (unique with provider), email_at_link |
| `user` (changed) | the profile | `cognito_id` nullable, dropped at day 30 |
| `organization` (changed) | the NGO | status (pending / active / suspended), validated_at, validated_by, tax_id, website, statute_url, suspended_at; `logo` holds an S3 key under `organizations/<id>/` (legacy NGO Hub URLs starting with `http` are passed through unchanged) |

The same migration adds `DISABLE_ADMIN` and `ENABLE_ADMIN` to `actions_archive_event_name_enum` for the Team page.

Indexes: unique `auth_token.token_hash`; partial unique `auth_identity (realm, email) WHERE deleted_on IS NULL`; partial `auth_token (identity_id, type)` for live rows; `refresh_token (identity_id)`, `refresh_token (previous_hash)`; unique `auth_identity_provider (provider, subject)`; `user_type_email_unique ON "user"(type, lower(email)) WHERE deleted_on IS NULL` (replaces `cognito-userType-email-unique`).

## A token's life

A one-time token row is accepted only while live: no `used_at`, no `replaced_at`, not expired. Rules:

- Link = 32 random bytes base64url (43 characters); hash = `HMAC-SHA256(AUTH_TOKEN_KEY, type + ':' + secret)`. Code = 6 digits; hash = `HMAC-SHA256(AUTH_TOKEN_KEY, identityId + ':' + type + ':' + code)`. The secret is never stored or logged. A link hash is bound to its type only, not to the identity (a recorded deviation from the design, which bound links to `identity_id`); codes are bound to the identity.
- Lifetimes: verify_email 24 h; reset_password link 1 h, code 15 min; invite 14 days from the Team page, 30 days from the migration script.
- One live token per identity and type; issuing a new one sets `replaced_at` on the old one. Different types do not cancel each other (the transition link and a Forgot password link both stay live).
- Consuming a reset_password or invite also replaces every other live reset_password and invite row for that identity, so a stray email cannot undo a password someone just chose.
- A code row ends after five wrong attempts. Links need no attempt limit.
- Consumed inside the transaction that applies the change.
- Per identity and type: one new token a minute, five an hour (Redis counters). Send invite: one per 10 minutes, five a day per target.

Refresh (`SessionService.rotate`, confirmed in Layer 3): find the row by hash; it must be live (not revoked, not expired) and its identity `active` and of the asking realm, else AUTH_008. Then one conditional UPDATE moves the hash to `previous_hash`, stores the new hash, extends `expires_at` and sets `rotated_at` and `last_used_at`, only while the row still holds the presented hash. Not found but a `previous_hash` matches: within 10 seconds of `rotated_at` (two tabs or requests crossed, or the UPDATE lost that race) the answer is a new access token **without** a refresh token, and the client keeps the refresh token it already has (only hashes are stored, so the current refresh token cannot be returned); later than that it is a replay: the session is revoked and the answer is AUTH_008. Otherwise AUTH_008.

Lockout (`AuthIdentityFacade`, Layer 2): the fifth wrong password in a row sets `locked_until = now + 15 min` and resets `failed_attempts` to 0, in one SQL statement, so after the lock the user gets five fresh tries. A successful login resets both and sets `last_login_at`.

Emails (`src/modules/auth/constants/auth-emails.ts`, Layer 3): Romanian first, English below, in `mail-template.hbs`. Every builder passes `title`, `subtitle`, `cta`, `code` and `english`. The template has optional `{{#if code}}` (the 6-digit code, large) and `{{#if english}}` blocks; `{{#if}}` on a missing key is safe under strict mode, so existing emails render unchanged.

## Endpoints

Web, `/auth/web` (`WebJwtAuthGuard`, public where marked):

| Route | Public | Answers |
|---|---|---|
| `POST login` | yes | 200 tokens + admin user + `vic_refresh` cookie; 409 AUTH_012 (checked first: no web identity but a mobile one), 401 AUTH_001, 403 AUTH_004 (disabled, or NGO suspended), 423 AUTH_002, 403 AUTH_003 |
| `POST refresh` | yes | 200 new access token + rotated cookie; 401 AUTH_008 clears it |
| `POST logout` | yes | 204 |
| `POST forgot-password` | yes | 200 always; a reset link |
| `POST resend-verification` | yes | 200 always; resends the NGO confirmation link if the email belongs to an unconfirmed registration |
| `PATCH change-password` | no | 204, other sessions revoked |
| `GET me` | no | the admin with `superAdmin` |

Shared, `/auth` (public): `GET token/:secret` → `{ type, purpose, realm, maskedEmail, organizationName? }` with `purpose` one of `transition`, `invite`, `reset`, `verify_email` (transition = an invite with no `sent_by`, made by the migration script); 400 AUTH_005. `POST token/:secret/resend` (200 always; a fresh link of the same type). `POST set-password { token, password }` (transition, reset and invite links): web realm → session + cookie; mobile realm → `{ realm: 'mobile', email }` and no session, the volunteer logs in in the app. `POST confirm-email { token }`: NGO link → NGO active + session; mobile link → `{ realm: 'mobile', email }`.

Mobile, `/mobile/auth` (`MobileJwtAuthGuard`, public where marked): `register`, `resend-verification` (200 always), `login`, `social { provider, token }` (a migrated volunteer still in `pending_password` is activated by a successful social sign-in), `refresh { refreshToken }`, `logout`, `forgot-password` (a code), `reset-password { email, code, password }`, `change-password`. Every `/mobile/*` route passes the version guard: `x-app-version` below `MOBILE_MIN_VERSION` → 426 AUTH_011. `GET /public/mobile-version` returns `{ minVersion }`.

Built in Layer 7 (checked 30 October 2026): the web, shared and mobile routes above, Swagger at `/api`. The logged-in admin is returned as `AdminProfilePresenter { id, name, email, phone, organizationId, superAdmin }`; `AdminUserPresenter` stays `{ id, name }` because the activity log shows it for other admins. Set-password, confirm-email and social sign-in refuse a disabled login (AUTH_004), so a live link cannot undo a Disable. `POST /mobile/user` takes the email from the login, never from the body.

Built in Layer 8 (checked 2 November 2026): logos are stored as **full public URLs** in the public bucket (deviation from R27: presigning cannot happen in the synchronous presenters); statutes are private keys presigned for a day where shown. A local S3 emulator is used when `AWS_S3_ENDPOINT` is set (with `AWS_S3_PUBLIC_BUCKET` and `AWS_S3_PUBLIC_BASE_URL`); staging and production leave all three unset. Team members without a login show as `no_login`; extra codes ORG_008, ORG_009, ORG_010.

Organizations: `POST /organizations/register` (public, multipart with `logo` and `statute`, Turnstile token; address is free text); `PATCH /organization` (every field, multipart). Super admin, `/admin/organizations` (`SuperAdminGuard`): `GET pending-validation`, `PATCH :id/validate`, `PATCH :id/suspend`, `PATCH :id/unsuspend`. Team, `/organization/team`: `GET`, `POST`, `POST :userId/invite`, `PATCH :userId/disable`, `PATCH :userId/enable`. Enable sends no email: an enabled admin who has no password gets one through `POST :userId/invite`.

## Error codes

| Code | Meaning | HTTP |
|---|---|---|
| AUTH_001 | Invalid email or password (also when no password is set yet) | 401 |
| AUTH_002 | Account locked, try later | 423 |
| AUTH_003 | Email not confirmed yet | 403 |
| AUTH_004 | Account disabled (or its NGO suspended) | 403 |
| AUTH_005 | Token or link invalid, expired or already used | 400 |
| AUTH_006 | Too many wrong codes, request a new one | 400 |
| AUTH_007 | Password does not meet the rules | 400 |
| AUTH_008 | Refresh token invalid or reused | 401 |
| AUTH_009 | Email already registered | 409 |
| AUTH_010 | Too many requests for this account | 429 |
| AUTH_011 | App version too old | 426 |
| AUTH_012 | Volunteer account on the web login | 409 |
| AUTH_013 | Social token invalid or email not verified | 401 |
| ORG_004 | An organization with the same name, email, phone or tax id exists | 409 |
| ORG_005 | Organization not validated | 403 |
| ORG_006 | Turnstile check failed on NGO registration | 400 |
| ORG_007 | Statute missing or not a PDF | 400 |
| ORG_008 | Team: the admin is not in your organization | 403 |
| ORG_009 | Team: invites are only for admins without a password | 400 |
| ORG_010 | Team: you cannot change your own status | 400 |
| MAINTENANCE | API in maintenance mode | 503 |

## Environment variables

| Variable | Meaning |
|---|---|
| `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` | RSA key pair, PEM, base64 on one line |
| `JWT_KEY_ID` | goes into the `kid` header; bump when rotating keys |
| `JWT_ACCESS_TTL_SECONDS` | 900 |
| `REFRESH_TTL_DAYS_WEB`, `REFRESH_TTL_DAYS_MOBILE` | 7 and 30 |
| `AUTH_TOKEN_KEY` | 32 random bytes, base64; HMAC key for links and codes |
| `WEB_APP_URL` | base of every link in an email |
| `CORS_ORIGINS` | comma-separated origins allowed to send the cookie |
| `MOBILE_MIN_VERSION` | lowest app version the API accepts |
| `MAINTENANCE_MODE` | `true` → 503 `MAINTENANCE` on everything except `GET /public/health` and allow-listed IPs |
| `MAINTENANCE_ALLOWED_IPS` | optional, comma separated; during maintenance these client IPs pass (the smoke-test team). The IP is `req.ip` with `trust proxy` 1: the address the load balancer appended to `X-Forwarded-For`, **not** the first hop, which the client can write itself (deviation from decisions R2, Layer 4) |
| `REDIS_KEY_PREFIX` | optional ioredis `keyPrefix`; empty in production, `test:` in `.env.test` |
| `TURNSTILE_SECRET` | Cloudflare Turnstile, NGO registration only |
| `GOOGLE_CLIENT_IDS`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `APPLE_BUNDLE_ID` | social token verification |
| `MAIL_CONTACT` | the address shown in emails and policy pages |

Removed at Layer 9: `COGNITO_*` (six variables) and `ONG_HUB_API`. `AWS_*` stay for S3.

Generate once per environment and keep in the secrets manager:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem
base64 -w0 private.pem   # JWT_PRIVATE_KEY (macOS: base64 -i private.pem | tr -d '\n')
base64 -w0 public.pem    # JWT_PUBLIC_KEY
openssl rand -base64 32  # AUTH_TOKEN_KEY
```

## Commands

Run with ts-node like the TypeORM scripts; each creates a Nest application context.

| Script | Does |
|---|---|
| `npm run auth:migrate -- [--dry-run]` | creates identities for every existing user (admins → web, volunteers → mobile, all pending_password), links Google / Facebook / Apple accounts from Cognito usernames (`google_…`, `facebook_…`, `signinwithapple_…`), queues one held 30-day transition email each; idempotent; prints counts |
| `npm run announce -- --release-transition` | releases the held transition emails at 10/s |
| `npm run announce -- --template <announce\|reminder> [--dry-run]` | T-7 and T-1 emails from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`); shipped to `main` in a separate PR before the cutover |
| `npm run announce -- --template back [--dry-run]` | after the switch: emails every identity and pushes every device |
| `npm run org:suspend -- <id> [--reason "..."]`, `npm run org:unsuspend -- <id>` | suspends or restores an NGO; while suspended its admins cannot log in and their sessions are revoked; identity status is not changed |
| `npm run auth:super-admin -- <email> [--remove]` | sets or clears the super admin flag |

Daily job `auth-maintenance-vic` at 03:30: deletes expired or long-revoked sessions, ended tokens older than 90 days, pending NGO registrations older than 7 days, unconfirmed mobile identities older than 7 days.

## Tests

- Unit: `npm run test` (`*.spec.ts` next to the code; `moduleNameMapper` resolves `src/...` imports). The repository and service specs use a real Postgres, so the local compose database must be up.
- Databases: `test/utils/test-data-source.ts` creates and migrates `vic_test_<jest worker>` (`DATABASE_TEST_NAME`, default `vic_test`) on the local server and refuses any `DATABASE_HOST` other than localhost / 127.0.0.1. One database per worker keeps parallel suites apart.
- End-to-end: `npm run test:e2e`. `test/setup-env.ts` (Jest `setupFiles`) loads `.env`, then `.env.test`, then generates a throwaway RSA key pair and `AUTH_TOKEN_KEY` in memory; no test secret is committed. `test/utils/test-app.ts` boots `AppModule` on the worker's database with the compose Redis (keys prefixed `test:`), `MailService` replaced by `FakeMailService` (tests read links and codes from `mailbox.sent`), and `mintAccessToken(identity, realm)` that creates a real session so the token carries `sid`. `test/harness.e2e-spec.ts` proves the three. Specs: `auth-web`, `auth-mobile`, `auth-social`, `realms`, `organization-registration`, `team`, `migration`.
- Pre-flight: `scripts/auth-preflight.sql` on a copy of production before the cutover migration, including the count of social Cognito users by provider.
