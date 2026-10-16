# Layer 2 · Repositories and AuthIdentityFacade

Status: ready-for-agent
Type: task
Blocked by: 02
Tracker card: B1 (part)

Still deployable with Cognito on. The facade is the only class other modules import.

## Checklist

- [ ] `src/modules/auth/interfaces/{auth-identity,auth-token,refresh-token,auth-identity-provider}-repository.interface.ts` (pattern `src/modules/user/interfaces/`).
- [ ] `src/modules/auth/repositories/`:
  - `auth-identity.repository.ts`: `find(options)` by id / realm + email / userId, `create`, `update`, `deleteByUserId`.
  - `auth-token.repository.ts`: `create`, `findByHash`, `findLiveToken(identityId, type)`, `replaceLiveTokens(identityId, types[], manager?)`, `consume(id, manager?)`, `incrementAttempts(id)`.
  - `refresh-token.repository.ts`: `create`, `findSessionByHash`, `findSessionByPreviousHash`, `rotate`, `revoke`, `revokeAllForIdentity(identityId, exceptId?)`, `deleteExpired(before)`.
  - `auth-identity-provider.repository.ts`: `findByProvider(provider, subject)`, `linkProvider`.
- [ ] `src/modules/auth/services/auth-identity.facade.ts` (`AuthIdentityFacade`): wraps the four repositories; `registerFailedLogin(identity)` (5th failure → `lockedUntil = now + 15 min`), `registerSuccessfulLogin(identity)` (reset counters, `lastLoginAt`). Register and export in `auth.module.ts`.
- [ ] `auth-identity.facade.spec.ts` with `jest.fn()` repositories: lockout on the fifth failure, reset on success, `deleteByUserId` reaches the repository.

## Done when

Build, lint, test pass. No controller or use case changed.

## Comments
