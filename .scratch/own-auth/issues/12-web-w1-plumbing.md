# W1 · Web: remove Amplify, API client with cookie refresh, AuthContext

Status: needs-info
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
