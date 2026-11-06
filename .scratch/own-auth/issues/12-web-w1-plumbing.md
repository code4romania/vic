# W1 · Web: remove Amplify, API client with cookie refresh, AuthContext

Status: done locally (2026-11-04)
Type: task
Blocked by: 08
Tracker card: W1

Outline until Layer 7 fixes the `/auth` contract (R25); then expand into a checklist. `../decisions.md` wins over this text and over the Guide.

- Remove `aws-amplify`, `@aws-amplify/ui-react`; delete `src/common/config/amplify.ts`, the `Amplify.configure` call in `App.tsx`; drop `VITE_AWS_REGION`, `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`, `VITE_COGNITO_OAUTH_DOMAIN` from `.env.example`, `vite-env.d.ts` (fix `VITE_FRONTEND_URL` → `VITE_APP_FRONTEND_URL` there) and the deploy config; remove `polyfillNode` and the `runtimeConfig` alias in `vite.config.ts` and the `global` polyfill in `index.html`. Add `VITE_TURNSTILE_SITE_KEY`, `VITE_APP_STORE_URL`, `VITE_PLAY_STORE_URL`, `VITE_MIGRATION_NOTICE_UNTIL`.
- `src/services/api.ts`: `withCredentials: true`; access token in memory (`src/services/auth/token.store.ts`); one shared `refresh()` promise on a 401, retry once, else clear and `/login`. Refresh on a 401 from any route except the public auth routes: login, refresh, logout, forgot-password, `token/*`, set-password, confirm-email, resend-verification (R23). So a 401 from `GET /auth/web/me` or `POST /auth/web/change-password` does refresh.
- A 503 with `MAINTENANCE` shows a maintenance message instead of the page. The new web build goes live at 0:45 in the window while the API still answers 503 to everyone outside `MAINTENANCE_ALLOWED_IPS` (R2).
- `src/services/auth/auth.api.ts` + `auth.service.ts` hooks, one per backend route. `AUTH_ERRORS` / `TEAM_ERRORS` classes in `src/common/errors/entities/`, registered in `internal-errors.class.ts`.
- `AuthContextProvider`: bootstrap `POST /auth/web/refresh` then `GET /auth/web/me`; new `IAdminProfile` type replaces the misuse of `IUser`; expose `isSuperAdmin`, `login(email, password)`, `logout` (also `queryClient.clear()`), `startSession`.

## Comments

- 2026-11-04: built and tested locally, no PR.
  - Removed `aws-amplify`, `@aws-amplify/ui-react`, `rollup-plugin-polyfill-node`, `src/common/config/amplify.ts`, the Amplify env vars, the `runtimeConfig` alias and the `global` polyfill. The build works without them. The deploy config (terraform) is issue 20.
  - `src/services/api.ts`: `withCredentials`, bearer from `src/services/auth/token.store.ts` (memory only), one shared refresh promise, retry once, no refresh on the public auth routes (R23), 503 MAINTENANCE → `src/pages/Maintenance.tsx`. Session end and maintenance reach the AuthContext through `apiEvents`.
  - `src/services/auth/auth.api.ts` + `auth.service.ts`: the auth routes only. Team, super admin and registration calls move to W3, next to their pages (deviation from the comment above).
  - `AUTH_ERRORS` / `AuthError` (`src/common/errors/entities/auth.errors.ts`), translations under `auth` and `login` in ro and en. `TEAM_ERRORS` comes with the Team page (W3).
  - `AuthContextProvider`: refresh → `/auth/web/me` on load; `IAdminProfile` (`src/common/interfaces/auth.interface.ts`); `isSuperAdmin`, `login(email, password)`, `logout` (+ `queryClient.clear()`), `startSession`.
  - Pulled forward from W2 to make W1 testable: `src/pages/Login.tsx` (email + password, migration notice until `VITE_MIGRATION_NOTICE_UNTIL`, AUTH codes, AUTH_003 resend, AUTH_012 volunteer box with store links, `vic://` only on phones). Links to `/forgot-password` and `/register` are 404 until W2/W3.
  - Browser check (Chrome, Vite on 5173, API on 4001): a restored session on load, logout 204 → /login, volunteer email → AUTH_012 box, admin login → dashboard, a deep-link reload restores the session with one refresh. With `JWT_ACCESS_TTL_SECONDS=20`: 4 parallel 401s → exactly one refresh → all 4 retried.
  - Found a backend bug: `GET /volunteer` answered 422 `column reference "status" is ambiguous`, because Layer 1 added `organization.status` and the volunteer query filtered on a bare `status`. Fixed in `volunteer.repository.ts` (`volunteer.status`); regression test in `test/guards.e2e-spec.ts`.
  - Not explained: once, right after an API restart, a reload's refresh got AUTH_008 for a token the DB did not know (no revocation). Not reproduced afterwards; probably a leftover cookie from earlier testing. Watch for it.
  - Local `frontend/.env` (gitignored): `VITE_API_URL=http://localhost:4001`, Turnstile test key, notice until 2026-12-31. Run Vite with `npx vite --port 5173`, since the backend's `CORS_ORIGINS` and `WEB_APP_URL` use 5173 and `npm start` uses 3000.

