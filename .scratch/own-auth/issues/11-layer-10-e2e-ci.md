# Layer 10 · End-to-end suite and CI

Status: done locally (2026-11-04); CI skipped
Type: test
Blocked by: 10
Tracker card: B7

These are the tests the cutover is gated on.

## Checklist

- [x] Harness: the base (`vic_test`, `.env.test`, `setupFiles`, `test/setup.ts`, fake `MailService`, token-minting helper) is built in Layer 3 (issue 04, decisions R13). This layer adds: Redis keys (prefixed `test:` by `REDIS_KEY_PREFIX`) flushed in `afterEach`; social verifiers and Turnstile faked; `jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })`; supertest helpers `asWeb(email)` / `asMobile(email)`.
- [x] `test/auth-web.e2e-spec.ts`, `auth-mobile`, `auth-social`, `realms`, `organization-registration`, `team`, `migration` — scenarios exactly as tracker card B7, plus: a disabled admin's existing access token is rejected on its next request (decisions R18); an admin of a suspended NGO cannot log in (AUTH_004) and gets back in after unsuspend; a web login with a volunteer's email answers AUTH_012; the mobile-realm set-password answers `{ realm: 'mobile', email }` with no session; `POST /auth/web/resend-verification` answers 200 for any email; a migrated pending_password volunteer signs in with Google and is active with the old profile (R4); one imported from a google_ Cognito username is found by its provider link and activated (R35, R4); GET /auth/token/:secret reports purpose transition for a migration link and invite for a Team invite (R16); PATCH /organization/team/:userId/enable sends no email (R20); POST /auth/token/:secret/resend answers 200 for a used, expired or unknown link (R14).
- [ ] `.github/workflows/backend-tests.yml`: on pull requests touching `backend/**`, services postgres and redis, `npm ci`, `npm run lint`, `npm run test`, `npm run test:e2e`. Coverage target 90 % on `src/modules/auth` and `src/usecases/auth`.

## Done when

`npm run test:e2e` green locally and in CI.

## Comments
- 2026-11-04: built locally, no PR. CI workflow (`.github/workflows/backend-tests.yml`) skipped on purpose: the user only wants a local proof that the plan works.
  - Harness: `test/utils/fake-social.ts` (fixture tokens for the three verifiers, overridden in `createTestApp`), `testApp.flushRedis()` (deletes `test:*` keys with an unprefixed client), `asWeb` / `asMobile` in `test/utils/http.ts`. Fake timers were not needed: time is moved by updating timestamps (`rotated_at`, `expires_at`, `locked_until`, `created_on`).
  - Fix found by the new migration spec: every test app runs a worker on the same Bull queues, so suites took each other's held transition emails. `test/setup-env.ts` now sets `BULL_PREFIX=test-bull-<jest worker>`.
  - New suites: `auth-social` (7), `realms` (5), `migration` (2). Added to `auth-web` (lockout 423, refresh replay window 3 s / 11 s, change password ends the other session, newer reset link ends the earlier, unknown emails send nothing, disabled admin login/refresh/old token R18), `auth-mobile` (code for A fails for B, refresh through the body with the replay window), `organization-registration` (pending NGO cleaned after 7 days, S3 files deleted, name free again), `team` (invite_expired after expiry, resend issues a working invite, then active).
  - Already covered before this layer: R14 resend 200 for used/expired/unknown, R16 purpose transition/invite, R20 enable sends no email, suspended NGO AUTH_004 and unsuspend, AUTH_012, x-app-version 426.
  - Result: `npm run test:e2e` 10 suites / 69 tests, green twice in a row; `npm run test` green; lint clean. Coverage (e2e alone) on src/modules/auth + src/usecases/auth: 92 % lines, 91 % functions, 66 % branches.

