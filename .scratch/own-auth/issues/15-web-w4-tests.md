# W4 · Web tests: Vitest + Testing Library + MSW

Status: done locally (2026-11-06); CI skipped
Type: test
Blocked by: 13, 14
Tracker card: W4

The web app has no test runner today. Setup: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`; `test` config in `vite.config.ts`; `"test": "vitest run"`; `src/test/server.ts` faking `/auth/*` (including token info, resend-token and `/auth/web/resend-verification`), `/organization/team`, `/organizations/register`, `/admin/organizations/*`. Add `npm run lint` and `npm run test` for `frontend/**` to CI.

## Specs

- [x] `services/api.test.ts`: one refresh for three parallel 401s, then the retries; a failed refresh clears and redirects to `/login`; no refresh on a 401 from a public auth route (login, refresh, logout, forgot-password, `token/*`, set-password, confirm-email, resend-verification); a 401 from `GET /auth/web/me` does refresh (R23); a 503 `MAINTENANCE` shows the maintenance message.
- [x] `AuthContextProvider.test.tsx`: refresh ok → `getMe`, authenticated, `isSuperAdmin` from the presenter; refresh fails → logged out and no `getMe`; logout flips the flag and clears the query cache.
- [x] `Router` / `Landing.test.tsx`: `/` shows Landing when logged out and the dashboard when logged in (R29); unknown route → 404.
- [x] `Login.test.tsx`: invalid email blocks; AUTH_001 to 004 messages; AUTH_003 → resend calls `/auth/web/resend-verification`; AUTH_012 → Open the app with `vic://login?email=` and store links; the notice before and after `VITE_MIGRATION_NOTICE_UNTIL`; no "email sent" wording on AUTH_001.
- [x] `SetPassword.test.tsx`: wording for each `purpose` (`transition`, `invite`, `reset`, `verify_email`, R16); the volunteer transition page shows the social sentence (R36); weak password refused; AUTH_005 → expired state, resend → "check your email"; web realm → `startSession`; mobile realm `{ realm: 'mobile', email }` → Open the app with that email and no session started (R17).
- [x] `ConfirmEmail.test.tsx`: NGO → session and banner; mobile realm → "Email confirmed. Open the app" with the email in the deep link, no session (R17).
- [x] `RegisterOrganization.test.tsx`: required fields including the statute PDF (a non-PDF refused by the `pdf` mode), free-text address (R6), Turnstile token sent, terms, password rule; ORG_004 409, ORG_006 and ORG_007 messages (R33); success screen.
- [x] `OrganizationValidation.test.tsx`: hidden for plain admins; Validate and Suspend confirm → toast.
- [x] `Team.test.tsx`: statuses, Send invite visibility, no Disable on yourself, Enable sends no invite (R20), confirm → toast.
- [x] `useVisibleRoutes` hides super-admin-only entries (`roles?` on `IRoute`) from plain admins.
- [x] The validation banner only while `validatedAt` is null.

## Done when

`npm run test` and `npm run lint` pass in `frontend/` locally and in CI.

## Comments

- 2026-11-06: built locally, no PR. CI (`npm run lint` + `npm run test` for `frontend/**`) skipped, same as Layer 10: local proof only.
  - Dev deps: vitest 2.1.9, jsdom 25, @testing-library/react 16 (+ dom, user-event, jest-dom), msw 2.7. `test` block in `vite.config.ts` (jsdom, globals, env with fake VITE_* values, eslint plugin off under Vitest); `"test": "vitest run"`, `"test:watch"`; `vitest/globals` in tsconfig types.
  - Harness: `src/test/server.ts` (MSW happy path for every route the web calls; specs override with `server.use`), `src/test/setup.ts` (jest-dom, i18n, ResizeObserver/matchMedia stubs, react-query logger muted, token cleared after each), `src/test/render.tsx` (`renderPage` with a fake AuthContext, MemoryRouter, fresh QueryClient; `t()` so specs read the real translations).
  - Gotcha: jsdom's XMLHttpRequest never finishes sending a File through MSW (multipart hangs), and MSW cannot read a jsdom multipart body either. Setup switches the app's axios instance to the fetch adapter (same interceptors); the registration spec reads the FormData from an axios request interceptor.
  - Specs (12 files, 67 tests): `services/api.test.ts`, `contexts/auth/AuthContextProvider.test.tsx`, `routes/RootRoute.test.tsx` (Landing/dashboard R29, 404, redirect), `pages/Login`, `SetPassword`, `ConfirmEmail`, `ForgotPassword`, `RegisterOrganization`, `OrganizationValidation`, `Team`, `hooks/useVisibleRoutes`, `components/ValidationBanner`.
  - Result: `npm run test` 67/67 twice, `npm run lint` clean, `tsc` clean, `npm run build` ok. Backend after the filter fix: unit 23 suites / 229, e2e 10 suites / 70.

