# Layer 2 · Repositories and AuthIdentityFacade

Status: done (built and tested locally, 2026-11-03)
Type: task
Blocked by: 02
Tracker card: B1 (part)

Still works with Cognito on; local only like Layer 1. The facade is the only class other modules import.

## Checklist

- [x] `src/modules/auth/interfaces/{auth-identity,auth-token,refresh-token,auth-identity-provider}-repository.interface.ts` (pattern `src/modules/user/interfaces/`).
- [x] `src/modules/auth/repositories/`:
  - `auth-identity.repository.ts`: `find(options)` by id / realm + email / userId, `create(options, manager?)`, `update(id, partial, manager?)`, `upsert(options, manager?)` on (realm, email) for `auth:migrate`, `deleteByUserId`, `findSuperAdmins()` (super_admin true, for the NGO-registered email), `findByOrganizationId(orgId)` (web identities of that NGO's admins), `deleteUnverifiedMobileBefore(date)` (mobile, `email_verified_at IS NULL`, created before `date`; for the cleanup job).
  - `auth-token.repository.ts`: `create(options, manager?)`, `findByHash` (live rows only), `findAnyByHash(hash)` (any state: used, replaced or expired; for token info and resend), `findLiveToken(identityId, type)`, `replaceLiveTokens(identityId, types[], manager?)`, `consume(id, manager?)`, `incrementAttempts(id)`, `deleteEndedBefore(date)` (used, replaced or expired before `date`).
  - `refresh-token.repository.ts`: `create`, `findSessionByHash`, `findSessionByPreviousHash`, `rotate`, `revoke`, `revokeAllForIdentity(identityId, exceptId?, manager?)`, `deleteExpiredOrRevokedBefore(date)`.
  - Transactions (decisions R9): every method that takes `manager?: EntityManager` uses `manager.getRepository(...)` when given one, so Layer 3 `issue(..., manager?)` and `revokeAll(..., manager?)` and the Layer 6 use cases join the caller's transaction. The queries above are decisions R10.
  - `auth-identity-provider.repository.ts`: `findByProvider(provider, subject)`, `linkProvider`.
- [x] `src/modules/auth/services/auth-identity.facade.ts` (`AuthIdentityFacade`): wraps the four repositories; `registerFailedLogin(identity)` (5th failure → `lockedUntil = now + 15 min`), `registerSuccessfulLogin(identity)` (reset counters, `lastLoginAt`). Register and export in `auth.module.ts`.
- [x] `auth-identity.facade.spec.ts` with `jest.fn()` repositories: lockout on the fifth failure, reset on success, `deleteByUserId` reaches the repository. Repository specs: a method given a `manager` uses it instead of the injected repository; `findAnyByHash` returns a used row and `findByHash` does not; `deleteEndedBefore` and `deleteExpiredOrRevokedBefore` keep rows newer than the date.

## Done when

Build, lint, test pass. No controller or use case changed.

## Comments
- 2026-10-30: Layer 2 built locally (uncommitted). Repositories `AuthIdentityRepository`, `AuthTokenRepository`, `RefreshTokenRepository`, `AuthIdentityProviderRepository` with the R9 `manager?` and R10 queries; `AuthIdentityFacade` registered and exported by `AuthenticationModule`, nothing imports it yet. Choices worth checking:
  - Every lookup or delete keyed by an id returns null, 0 or false when the key is falsy (TypeORM 0.3.20 drops undefined where keys, R5); `deleteByUserId(undefined)` deletes nothing.
  - Lockout is one SQL statement (`registerFailedLogin(id, max, lockUntil)`), so concurrent failures cannot skip the lock; the fifth failure sets `locked_until` and resets `failed_attempts` to 0, so after the 15 minutes the user gets five fresh tries. Constants in `AUTH_LOCKOUT` (auth.constants.ts). The facade also has `isLocked(identity)`.
  - `upsert` is `INSERT ... ON CONFLICT DO NOTHING` and returns `{ identity, created }`, so `auth:migrate` can queue the transition email only for new rows.
  - `consume` and `revoke` only change a row that is still unused / unrevoked and return whether they did, so two concurrent requests cannot both use one link.
  - `deleteExpiredOrRevokedBefore(expiredBefore, revokedBefore = expiredBefore)`: two dates, because the cleanup job uses now() for expiry and now() - 7 days for revocation.
  - Deletes are hard deletes, so the foreign keys cascade.
  Tests: `auth-identity.facade.spec.ts` (mocked repositories) and `auth.repositories.spec.ts` against a real database. That needed part of the Layer 3 harness now: `test/utils/test-data-source.ts` creates `vic_test` on the local compose Postgres if missing, runs the migrations, and refuses any DATABASE_HOST other than localhost / 127.0.0.1. `DATABASE_TEST_NAME` added to `.env.example`. So `npm run test` now needs the local database up. The lockout and undefined-key specs were checked to fail when their code is broken. Build, lint, test pass (4 suites, 45 tests).
