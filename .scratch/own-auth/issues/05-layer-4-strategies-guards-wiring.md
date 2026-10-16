# Layer 4 · RS256 strategies, guards, maintenance middleware, cookies, CORS

Status: ready-for-agent
Type: task
Blocked by: 04
Tracker card: B2 (part)

Point of no return: after this layer the API rejects Cognito tokens. Layers 4–10 merge to `main` together.

## Checklist

- [ ] Rewrite `src/modules/auth/strategies/jwt-web.strategy.ts` and `jwt-mobile.strategy.ts` keeping class names and `AUTH_STRATEGIES.*`: `secretOrKey` = public key, `algorithms: ['RS256']`, `issuer: 'vic-api'`, `audience` vic-web / vic-mobile. `validate(payload)`: identity by `payload.sub`, must be `active`; web → `findAdminUser({ id: identity.userId })`, reject when none, set `role: Role.ADMIN` and `superAdmin`; mobile → `findRegularUser({ id })`, or `{ identityId, email, role: Role.VOLUNTEER }` when no profile yet.
- [ ] Delete `src/modules/auth/guards/jwt-all.guard.ts`. Add `src/modules/auth/guards/super-admin.guard.ts` (`request.user.superAdmin === true` or 403).
- [ ] `src/infrastructure/guards/mobile-version.guard.ts` as `APP_GUARD`: acts only when the path starts with `/mobile`; `x-app-version` below `MOBILE_MIN_VERSION` (semver compare) → 426 AUTH_011; missing header passes.
- [ ] `src/infrastructure/middleware/maintenance.middleware.ts`: `MAINTENANCE_MODE=true` → `503 { code_error: 'MAINTENANCE' }` for everything except `GET /public/health`. `app.module.ts`: rename `onfigure` → `configure`, apply it to `*`; drop the never-active `RawBodyMiddleware` / `JsonBodyMiddleware` registrations (say so in the PR).
- [ ] `src/api/auth/cookies.ts`: `setRefreshCookie(res, secret)`, `clearRefreshCookie(res)` — name `vic_refresh`, httpOnly, secure unless `NODE_ENV=local`, `sameSite: 'lax'`, `path: '/auth/web'`, `maxAge` = `REFRESH_TTL_DAYS_WEB`.
- [ ] `src/main.ts`: `app.use(cookieParser())`; `enableCors({ origin: CORS_ORIGINS.split(','), credentials: true, exposedHeaders: 'content-disposition' })`.
- [ ] `auth.module.ts`: provide and export the services from Layer 3 and the guards.
- [ ] Specs: `jwt-web.strategy.spec` (disabled identity rejected, no admin row rejected, superAdmin carried), `jwt-mobile.strategy.spec` (stub returned when no profile), `mobile-version.guard.spec` (lower version 426, equal passes, missing header passes, non-mobile path ignored), `super-admin.guard.spec`, `maintenance.middleware.spec`.

## Done when

Build, lint, test pass. A request with a Cognito token gets 401; a request with a token signed by the test key and a seeded identity passes the guard.

## Comments
