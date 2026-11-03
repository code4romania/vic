# Layer 7 · Controllers; adapt the Cognito-dependent use cases

Status: done (built and tested locally, 2026-11-03)
Type: task
Blocked by: 07
Tracker card: B3

Thin controllers over Layer 6, and the existing code stops depending on `cognitoId`. After this layer the `/auth` and `/mobile/auth` contract is fixed and mobile issues get their detail; the organization, Team and super admin routes are fixed at Layer 8, so web issues 13 and 14 wait for issue 09 (decisions R25).

## Checklist

- [x] `src/api/auth/web-auth.controller.ts` `@Controller('auth/web')`, `@UseGuards(WebJwtAuthGuard)`: `POST login` (`@Public()`, 200 `SessionPresenter` + `vic_refresh` cookie), `POST refresh` (`@Public()`, cookie in, rotated cookie out; AUTH_008 clears it), `POST logout` (`@Public()`, 204), `POST forgot-password` (`@Public()`, 200 always), `POST resend-verification` (`@Public()`, `ResendVerificationDto`, 200 always; resends the NGO confirmation link, decisions R15), `PATCH change-password` (204; keeps `request.user.sessionId`), `GET me` (`AdminUserPresenter`).
- [x] `src/api/auth/token.controller.ts` `@Controller('auth')`, all `@Public()`: `GET token/:secret` (`TokenInfoPresenter`; AUTH_005), `POST token/:secret/resend` (200 always, rate-limited), `POST set-password`, `POST confirm-email` (web realm → `SessionPresenter` + cookie; mobile realm → `{ realm: 'mobile', email }`, no session, decisions R17).
- [x] `src/api/_mobile/auth/auth.controller.ts` `@Controller('mobile/auth')`, `@UseGuards(MobileJwtAuthGuard)`: `register` (201), `resend-verification`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `change-password`, `social`.
- [x] `@Throttle({ default: { limit: 10, ttl: 60000 } })` on login, social, forgot-password, both resend-verification routes and the token routes. `GET /public/mobile-version` → `{ minVersion }` in `src/api/public/public.controller.ts`. Register the controllers in `src/api/api.module.ts`.
- [x] Delete `src/api/auth/auth.controller.ts`, `src/usecases/user/get-user-profile.usecase.ts`; remove `OngHubModule` from `use-case.module.ts`.
- [x] `create-regular-user.usecase.ts`: takes `identityId`, no `CognitoService`, refuses an identity that already has a `userId`, sets `identity.userId` after creating the user. `update-regular-user.usecase.ts`: drop the Cognito phone update. `delete-account.usecase.ts`: `authIdentityFacade.deleteByUserId(userId)` (FK cascades remove tokens, sessions, provider links). `src/api/_mobile/user/user.controller.ts`: create passes `identityId`; `GET profile` by `user.id`. Every route that takes `user.id` (get profile, `PATCH profile`, `PATCH personal-data`, `DELETE`) and the use cases behind them (`get-regule-user-profile`, `update-regular-user`, `update-user-personal-data`, `switch-organization`, `delete-account`) throw USER_001 (404) when the id is falsy, before calling the facade; otherwise `{ id: undefined }` matches the first user and `DELETE /mobile/user` would delete someone else's account. The 404 on get profile stays the app's signal to open CreateUser. The same gap exists today behind the Cognito `{ cognitoId }` stub, hidden only by the app's routing. Remove `CognitoProviderModule` from `app.module.ts` once nothing imports `CognitoService`.
- [x] Specs for the adapted use cases: create refuses a used identity and sets `userId`; delete calls the facade; profile, update, personal data, switch organization and delete answer USER_001 for a user with no id and touch no other row.

## Done when

Build, lint, test pass; `NODE_ENV=local npm run start` boots and Swagger lists the new `/auth`, `/mobile/auth` and `/public/mobile-version` routes with their Layer 5 DTOs and presenters (check moved here from Layer 5, decisions R26); `curl -X POST /auth/web/login` with a bad password answers `401 AUTH_001` and sends no email.

## Comments
- 2026-10-30: Layer 7 built locally (uncommitted). `WebAuthController` (`/auth/web`), `TokenController` (`/auth`, no guard, all public), `MobileAuthController` (`/mobile/auth`), `GET /public/mobile-version`; `ApiModule` imports `AuthenticationModule`. `auth.controller.ts`, `get-user-profile.usecase.ts`, `OngHubModule` (from `use-case.module.ts`) and `CognitoProviderModule` (from `app.module.ts` and the providers index) removed; the `cognito/` and `onghub/` folders go in Layer 9. `IUserModel.cognitoId` is optional now.
  - `POST /mobile/user` takes the email from the login, not the body (the body's `email` is ignored): the profile always carries the address that was confirmed. It refuses a login that already has a profile (USER_003) and a web login (USER_005).
  - Get profile, update profile, personal data, switch organization and delete account answer USER_001 for a falsy id before any lookup.
  - Throttling: every auth route that sends email or checks a password has `@Throttle(10/min)`. Since Layer 4's `trust proxy` 1, `ThrottlerGuardByIP` (`req.ips[0]`) counts per real client; before, behind the ALB, every user shared one bucket.
  Checked: build, lint, `npm run test` (183 tests), `npm run test:e2e` (30 tests: `auth-web`, `auth-mobile`, `guards`, `harness`), and on the live local API (port 4001): a wrong password answers 401 AUTH_001 with nothing in mailcatcher; Swagger lists the 21 new routes with their DTOs and presenters; a throwaway volunteer registered, got the real email in mailcatcher through the Bull queue, confirmed and logged in (then deleted).
- 2026-11-02: Manual test by Laurentiu on the local API through Swagger and mailcatcher, all as expected: admin transition link → set password → login → me; refresh cookie; change password; logout; web forgot password (link once, unknown email silent); lockout (5 × AUTH_001 then AUTH_002); volunteer register → AUTH_003 → confirm-email → login → USER_001 → create profile (email from the login) → code reset; AUTH_012 for a volunteer on the web login; realms do not mix; mobile-version.
- 2026-11-03: **Tested by hand** locally (Swagger + mailcatcher, Laurentiu), all as expected:
  - Web admin: login, `GET /auth/web/me`, refresh (rotating `vic_refresh` cookie), change password (401 AUTH_001 on a wrong current one, notice email), logout (then 401 AUTH_008 on refresh), forgot password (reset link, `GET /auth/token/{secret}`, `POST /auth/set-password`, 400 AUTH_005 on reuse, 200 and no email for an unknown address), lockout (423 AUTH_002 after 5 failures).
  - Mobile volunteer: register, 403 AUTH_003 before confirming, confirm email, login, 404 USER_001 before a profile, create profile (email taken from the login, not the body), forgot password with a 6-digit code.
  - Cross-checks: a volunteer on the web login gets 409 AUTH_012; a mobile token on `/auth/web/me` gets 401; `GET /public/mobile-version`.
  The `x-app-version` 426 (AUTH_011) is covered by the e2e guards suite only.
