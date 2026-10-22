# Layer 4 · RS256 strategies, guards, maintenance middleware, cookies, CORS

Status: ready-for-agent
Type: task
Blocked by: 04
Tracker card: B2 (part)

Point of no return: after this layer the API rejects Cognito tokens. The whole branch (Layers 0 to 10) reaches `main` together, and only after the staging rehearsal (local first, decided 21 Oct 2026).

## Checklist

- [ ] Rewrite `src/modules/auth/strategies/jwt-web.strategy.ts` and `jwt-mobile.strategy.ts` keeping class names and `AUTH_STRATEGIES.*`: `secretOrKey` = public key, `algorithms: ['RS256']`, `issuer: 'vic-api'`, `audience` vic-web / vic-mobile. `validate(payload)`: identity by `payload.sub`, must be `active`, so a disabled identity's tokens are rejected on the next request (decisions R18); check `identity.userId` before any user lookup, because TypeORM 0.3.20 drops null or undefined `where` keys (`SelectQueryBuilder.js:2468`) and `{ id: undefined }` returns the first user in the table. Web → `userId` null: reject; else `findAdminUser({ id: identity.userId })`, reject when none; reject when the admin's organization is `suspended` (AUTH_004, decisions R8; identity status is not touched by suspend); set `role: Role.ADMIN` and `superAdmin`. Mobile → `userId` null: return `{ identityId, email, role: Role.VOLUNTEER }` without querying; else `findRegularUser({ id: identity.userId })`. Both strategies also put `identityId` and `sessionId` (from the `sid` claim) on `request.user` (decisions R11; change-password keeps the current session).
- [ ] Delete `src/modules/auth/guards/jwt-all.guard.ts`. Add `src/modules/auth/guards/super-admin.guard.ts` (`request.user.superAdmin === true` or 403). The global `RolesGuard` runs before the controller JWT guards, so `@Roles` stays unusable; super admin routes use `@UseGuards(WebJwtAuthGuard, SuperAdminGuard)`, JWT guard first (decisions R28).
- [ ] `src/infrastructure/guards/mobile-version.guard.ts` as `APP_GUARD`: acts only when the path starts with `/mobile`; `x-app-version` below `MOBILE_MIN_VERSION` (`semver.lt`, package added in Layer 3) → 426 AUTH_011; missing header passes.
- [ ] `src/infrastructure/middleware/maintenance.middleware.ts`: `MAINTENANCE_MODE=true` → `503 { code_error: 'MAINTENANCE' }` for everything except `GET /public/health` and requests from the allow-list (decisions R2): optional `MAINTENANCE_ALLOWED_IPS` (comma separated, added to `environment-config.ts` and `.env.example`); the client IP is the first `X-Forwarded-For` hop, with `app.set('trust proxy', 1)` in `main.ts`. The smoke test at cutover and in the rehearsal runs from an allow-listed network. `app.module.ts`: rename `onfigure` → `configure`, apply it to `*`; drop the never-active `RawBodyMiddleware` / `JsonBodyMiddleware` registrations (say so in the PR).
- [ ] `src/api/auth/cookies.ts`: `setRefreshCookie(res, secret)`, `clearRefreshCookie(res)` — name `vic_refresh`, httpOnly, secure unless `NODE_ENV=local`, `sameSite: 'lax'`, `path: '/auth/web'`, `maxAge` = `REFRESH_TTL_DAYS_WEB`.
- [ ] `src/main.ts`: `app.use(cookieParser())`; `enableCors({ origin: CORS_ORIGINS.split(','), credentials: true, exposedHeaders: 'content-disposition' })`.
- [ ] `auth.module.ts`: provide and export the services from Layer 3 and the guards.
- [ ] Specs: `jwt-web.strategy.spec` (disabled identity rejected even with a token signed before it was disabled, no admin row or null `userId` rejected, suspended organization rejected with AUTH_004, superAdmin, `identityId` and `sessionId` carried), `jwt-mobile.strategy.spec` (null `userId` returns the stub and never queries the user table; `identityId` and `sessionId` carried), `mobile-version.guard.spec` (lower version 426, equal passes, missing header passes, non-mobile path ignored), `super-admin.guard.spec`, `maintenance.middleware.spec` (off passes; on → 503 MAINTENANCE; health passes; first `X-Forwarded-For` hop in `MAINTENANCE_ALLOWED_IPS` passes; an allow-listed IP in a later hop does not).

## Done when

Build, lint, test pass. A request with a Cognito token gets 401; a request with a token minted by the Layer 3 harness for a seeded identity passes the guard; with `MAINTENANCE_MODE=true` only an allow-listed IP gets through.

## Comments
