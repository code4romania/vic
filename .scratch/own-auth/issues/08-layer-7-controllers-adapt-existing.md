# Layer 7 · Controllers; adapt the Cognito-dependent use cases

Status: ready-for-agent
Type: task
Blocked by: 07
Tracker card: B3

Thin controllers over Layer 6, and the existing code stops depending on `cognitoId`. After this layer the `/auth` and `/mobile/auth` contract is fixed and mobile issues get their detail; the organization, Team and super admin routes are fixed at Layer 8, so web issues 13 and 14 wait for issue 09 (decisions R25).

## Checklist

- [ ] `src/api/auth/web-auth.controller.ts` `@Controller('auth/web')`, `@UseGuards(WebJwtAuthGuard)`: `POST login` (`@Public()`, 200 `SessionPresenter` + `vic_refresh` cookie), `POST refresh` (`@Public()`, cookie in, rotated cookie out; AUTH_008 clears it), `POST logout` (`@Public()`, 204), `POST forgot-password` (`@Public()`, 200 always), `POST resend-verification` (`@Public()`, `ResendVerificationDto`, 200 always; resends the NGO confirmation link, decisions R15), `PATCH change-password` (204; keeps `request.user.sessionId`), `GET me` (`AdminUserPresenter`).
- [ ] `src/api/auth/token.controller.ts` `@Controller('auth')`, all `@Public()`: `GET token/:secret` (`TokenInfoPresenter`; AUTH_005), `POST token/:secret/resend` (200 always, rate-limited), `POST set-password`, `POST confirm-email` (web realm → `SessionPresenter` + cookie; mobile realm → `{ realm: 'mobile', email }`, no session, decisions R17).
- [ ] `src/api/_mobile/auth/auth.controller.ts` `@Controller('mobile/auth')`, `@UseGuards(MobileJwtAuthGuard)`: `register` (201), `resend-verification`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `change-password`, `social`.
- [ ] `@Throttle({ default: { limit: 10, ttl: 60000 } })` on login, social, forgot-password, both resend-verification routes and the token routes. `GET /public/mobile-version` → `{ minVersion }` in `src/api/public/public.controller.ts`. Register the controllers in `src/api/api.module.ts`.
- [ ] Delete `src/api/auth/auth.controller.ts`, `src/usecases/user/get-user-profile.usecase.ts`; remove `OngHubModule` from `use-case.module.ts`.
- [ ] `create-regular-user.usecase.ts`: takes `identityId`, no `CognitoService`, refuses an identity that already has a `userId`, sets `identity.userId` after creating the user. `update-regular-user.usecase.ts`: drop the Cognito phone update. `delete-account.usecase.ts`: `authIdentityFacade.deleteByUserId(userId)` (FK cascades remove tokens, sessions, provider links). `src/api/_mobile/user/user.controller.ts`: create passes `identityId`; `GET profile` by `user.id`. Every route that takes `user.id` (get profile, `PATCH profile`, `PATCH personal-data`, `DELETE`) and the use cases behind them (`get-regule-user-profile`, `update-regular-user`, `update-user-personal-data`, `switch-organization`, `delete-account`) throw USER_001 (404) when the id is falsy, before calling the facade; otherwise `{ id: undefined }` matches the first user and `DELETE /mobile/user` would delete someone else's account. The 404 on get profile stays the app's signal to open CreateUser. The same gap exists today behind the Cognito `{ cognitoId }` stub, hidden only by the app's routing. Remove `CognitoProviderModule` from `app.module.ts` once nothing imports `CognitoService`.
- [ ] Specs for the adapted use cases: create refuses a used identity and sets `userId`; delete calls the facade; profile, update, personal data, switch organization and delete answer USER_001 for a user with no id and touch no other row.

## Done when

Build, lint, test pass; `NODE_ENV=local npm run start` boots and Swagger lists the new `/auth`, `/mobile/auth` and `/public/mobile-version` routes with their Layer 5 DTOs and presenters (check moved here from Layer 5, decisions R26); `curl -X POST /auth/web/login` with a bad password answers `401 AUTH_001` and sends no email.

## Comments
