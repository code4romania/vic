# Layer 2 · Repositories and AuthIdentityFacade

Status: ready-for-agent
Type: task
Blocked by: 02
Tracker card: B1 (part)

Still works with Cognito on; local only like Layer 1. The facade is the only class other modules import.

## Checklist

- [ ] `src/modules/auth/interfaces/{auth-identity,auth-token,refresh-token,auth-identity-provider}-repository.interface.ts` (pattern `src/modules/user/interfaces/`).
- [ ] `src/modules/auth/repositories/`:
  - `auth-identity.repository.ts`: `find(options)` by id / realm + email / userId, `create(options, manager?)`, `update(id, partial, manager?)`, `upsert(options, manager?)` on (realm, email) for `auth:migrate`, `deleteByUserId`, `findSuperAdmins()` (super_admin true, for the NGO-registered email), `findByOrganizationId(orgId)` (web identities of that NGO's admins), `deleteUnverifiedMobileBefore(date)` (mobile, `email_verified_at IS NULL`, created before `date`; for the cleanup job).
  - `auth-token.repository.ts`: `create(options, manager?)`, `findByHash` (live rows only), `findAnyByHash(hash)` (any state: used, replaced or expired; for token info and resend), `findLiveToken(identityId, type)`, `replaceLiveTokens(identityId, types[], manager?)`, `consume(id, manager?)`, `incrementAttempts(id)`, `deleteEndedBefore(date)` (used, replaced or expired before `date`).
  - `refresh-token.repository.ts`: `create`, `findSessionByHash`, `findSessionByPreviousHash`, `rotate`, `revoke`, `revokeAllForIdentity(identityId, exceptId?, manager?)`, `deleteExpiredOrRevokedBefore(date)`.
  - Transactions (decisions R9): every method that takes `manager?: EntityManager` uses `manager.getRepository(...)` when given one, so Layer 3 `issue(..., manager?)` and `revokeAll(..., manager?)` and the Layer 6 use cases join the caller's transaction. The queries above are decisions R10.
  - `auth-identity-provider.repository.ts`: `findByProvider(provider, subject)`, `linkProvider`.
- [ ] `src/modules/auth/services/auth-identity.facade.ts` (`AuthIdentityFacade`): wraps the four repositories; `registerFailedLogin(identity)` (5th failure → `lockedUntil = now + 15 min`), `registerSuccessfulLogin(identity)` (reset counters, `lastLoginAt`). Register and export in `auth.module.ts`.
- [ ] `auth-identity.facade.spec.ts` with `jest.fn()` repositories: lockout on the fifth failure, reset on success, `deleteByUserId` reaches the repository. Repository specs: a method given a `manager` uses it instead of the injected repository; `findAnyByHash` returns a used row and `findByHash` does not; `deleteEndedBefore` and `deleteExpiredOrRevokedBefore` keep rows newer than the date.

## Done when

Build, lint, test pass. No controller or use case changed.

## Comments
