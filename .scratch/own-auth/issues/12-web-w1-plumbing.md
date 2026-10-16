# W1 · Web: remove Amplify, API client with cookie refresh, AuthContext

Status: needs-info
Type: task
Blocked by: 08
Tracker card: W1

Outline until Layer 7 fixes the API contract; then expand into a checklist.

- Remove `aws-amplify`, `@aws-amplify/ui-react`; delete `src/common/config/amplify.ts`, the `Amplify.configure` call in `App.tsx`; drop `VITE_AWS_REGION`, `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`, `VITE_COGNITO_OAUTH_DOMAIN` from `.env.example`, `vite-env.d.ts` (fix `VITE_FRONTEND_URL` → `VITE_APP_FRONTEND_URL` there) and the deploy config; remove `polyfillNode` and the `runtimeConfig` alias in `vite.config.ts` and the `global` polyfill in `index.html`. Add `VITE_TURNSTILE_SITE_KEY`, `VITE_APP_STORE_URL`, `VITE_PLAY_STORE_URL`, `VITE_MIGRATION_NOTICE_UNTIL`.
- `src/services/api.ts`: `withCredentials: true`; access token in memory (`src/services/auth/token.store.ts`); one shared `refresh()` promise on 401 for non-`/auth/` routes, retry once, else clear and `/login`.
- `src/services/auth/auth.api.ts` + `auth.service.ts` hooks, one per backend route. `AUTH_ERRORS` / `TEAM_ERRORS` classes in `src/common/errors/entities/`, registered in `internal-errors.class.ts`.
- `AuthContextProvider`: bootstrap `POST /auth/web/refresh` then `GET /auth/web/me`; new `IAdminProfile` type replaces the misuse of `IUser`; expose `isSuperAdmin`, `login(email, password)`, `logout` (also `queryClient.clear()`), `startSession`.

## Comments
