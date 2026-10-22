# Layer 10 · End-to-end suite and CI

Status: ready-for-agent
Type: test
Blocked by: 10
Tracker card: B7

These are the tests the cutover is gated on.

## Checklist

- [ ] Harness: the base (`vic_test`, `.env.test`, `setupFiles`, `test/setup.ts`, fake `MailService`, token-minting helper) is built in Layer 3 (issue 04, decisions R13). This layer adds: Redis keys (prefixed `test:` by `REDIS_KEY_PREFIX`) flushed in `afterEach`; social verifiers and Turnstile faked; `jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })`; supertest helpers `asWeb(email)` / `asMobile(email)`.
- [ ] `test/auth-web.e2e-spec.ts`, `auth-mobile`, `auth-social`, `realms`, `organization-registration`, `team`, `migration` — scenarios exactly as tracker card B7, plus: a disabled admin's existing access token is rejected on its next request (decisions R18); an admin of a suspended NGO cannot log in (AUTH_004) and gets back in after unsuspend; a web login with a volunteer's email answers AUTH_012; the mobile-realm set-password answers `{ realm: 'mobile', email }` with no session; `POST /auth/web/resend-verification` answers 200 for any email; a migrated pending_password volunteer signs in with Google and is active with the old profile (R4); one imported from a google_ Cognito username is found by its provider link and activated (R35, R4); GET /auth/token/:secret reports purpose transition for a migration link and invite for a Team invite (R16); PATCH /organization/team/:userId/enable sends no email (R20); POST /auth/token/:secret/resend answers 200 for a used, expired or unknown link (R14).
- [ ] `.github/workflows/backend-tests.yml`: on pull requests touching `backend/**`, services postgres and redis, `npm ci`, `npm run lint`, `npm run test`, `npm run test:e2e`. Coverage target 90 % on `src/modules/auth` and `src/usecases/auth`.

## Done when

`npm run test:e2e` green locally and in CI.

## Comments
