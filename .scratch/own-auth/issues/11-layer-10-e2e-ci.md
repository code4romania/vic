# Layer 10 · End-to-end suite and CI

Status: ready-for-agent
Type: test
Blocked by: 10
Tracker card: B7

These are the tests the cutover is gated on.

## Checklist

- [ ] Harness: `vic_test` database via a compose init script; `.env.test` loaded from `test/jest-e2e.json` `setupFiles`; `test/setup.ts` runs migrations and truncates auth, organization and user tables between tests; Redis keys prefixed `test:` and flushed in `afterEach`; `MailService` overridden with a collecting fake; social verifiers and Turnstile faked; `jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] })`; supertest helpers `asWeb(email)` / `asMobile(email)`.
- [ ] `test/auth-web.e2e-spec.ts`, `auth-mobile`, `auth-social`, `realms`, `organization-registration`, `team`, `migration` — scenarios exactly as tracker card B7.
- [ ] `.github/workflows/backend-tests.yml`: on pull requests touching `backend/**`, services postgres and redis, `npm ci`, `npm run lint`, `npm run test`, `npm run test:e2e`. Coverage target 90 % on `src/modules/auth` and `src/usecases/auth`.

## Done when

`npm run test:e2e` green locally and in CI.

## Comments
