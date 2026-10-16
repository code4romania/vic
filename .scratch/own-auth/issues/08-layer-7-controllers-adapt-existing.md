# Layer 7 · Controllers; adapt the Cognito-dependent use cases

Status: ready-for-agent
Type: task
Blocked by: 07
Tracker card: B3

Thin controllers over Layer 6, and the existing code stops depending on `cognitoId`. After this layer the API contract is fixed: web and mobile issues get their detail.

## Checklist

- [ ] `src/api/auth/web-auth.controller.ts` `@Controller('auth/web')`, `@UseGuards(WebJwtAuthGuard)`: `POST login` (`@Public()`, 200 `SessionPresenter` + `vic_refresh` cookie), `POST refresh` (`@Public()`, cookie in, rotated cookie out; AUTH_008 clears it), `POST logout` (`@Public()`, 204), `POST forgot-password` (`@Public()`, 200 always), `PATCH change-password` (204), `GET me` (`AdminUserPresenter`).
- [ ] `src/api/auth/token.controller.ts` `@Controller('auth')`, all `@Public()`: `GET token/:secret` (`TokenInfoPresenter`; AUTH_005), `POST token/:secret/resend` (200 always, rate-limited), `POST set-password`, `POST confirm-email`.
- [ ] `src/api/_mobile/auth/auth.controller.ts` `@Controller('mobile/auth')`, `@UseGuards(MobileJwtAuthGuard)`: `register` (201), `resend-verification`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, `change-password`, `social`.
- [ ] `@Throttle({ default: { limit: 10, ttl: 60000 } })` on login, social, forgot-password, resend and token routes. `GET /public/mobile-version` → `{ minVersion }` in `src/api/public/public.controller.ts`. Register the controllers in `src/api/api.module.ts`.
- [ ] Delete `src/api/auth/auth.controller.ts`, `src/usecases/user/get-user-profile.usecase.ts`; remove `OngHubModule` from `use-case.module.ts`.
- [ ] `create-regular-user.usecase.ts`: takes `identityId`, no `CognitoService`, refuses an identity that already has a `userId`, sets `identity.userId` after creating the user. `update-regular-user.usecase.ts`: drop the Cognito phone update. `delete-account.usecase.ts`: `authIdentityFacade.deleteByUserId(userId)` (FK cascades remove tokens, sessions, provider links). `src/api/_mobile/user/user.controller.ts`: create passes `identityId`; `GET profile` by `user.id`, USER_001 when undefined. Remove `CognitoProviderModule` from `app.module.ts` once nothing imports `CognitoService`.
- [ ] Specs for the adapted use cases.

## Done when

Build, lint, test pass; `NODE_ENV=local npm run start` boots and Swagger lists the new routes; `curl -X POST /auth/web/login` with a bad password answers `401 AUTH_001` and sends no email.

## Comments
