# W4 · Web tests: Vitest + Testing Library + MSW

Status: needs-info
Type: test
Blocked by: 13, 14
Tracker card: W4

The web app has no test runner today. Setup: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`; `test` config in `vite.config.ts`; `"test": "vitest run"`; `src/test/server.ts` faking `/auth/*` (including token info, resend-token and `/auth/web/resend-verification`), `/organization/team`, `/organizations/register`, `/admin/organizations/*`. Add `npm run lint` and `npm run test` for `frontend/**` to CI.

## Specs

- [ ] `services/api.test.ts`: one refresh for three parallel 401s, then the retries; a failed refresh clears and redirects to `/login`; no refresh on a 401 from a public auth route (login, refresh, logout, forgot-password, `token/*`, set-password, confirm-email, resend-verification); a 401 from `GET /auth/web/me` does refresh (R23); a 503 `MAINTENANCE` shows the maintenance message.
- [ ] `AuthContextProvider.test.tsx`: refresh ok → `getMe`, authenticated, `isSuperAdmin` from the presenter; refresh fails → logged out and no `getMe`; logout flips the flag and clears the query cache.
- [ ] `Router` / `Landing.test.tsx`: `/` shows Landing when logged out and the dashboard when logged in (R29); unknown route → 404.
- [ ] `Login.test.tsx`: invalid email blocks; AUTH_001 to 004 messages; AUTH_003 → resend calls `/auth/web/resend-verification`; AUTH_012 → Open the app with `vic://login?email=` and store links; the notice before and after `VITE_MIGRATION_NOTICE_UNTIL`; no "email sent" wording on AUTH_001.
- [ ] `SetPassword.test.tsx`: wording for each `purpose` (`transition`, `invite`, `reset`, `verify_email`, R16); the volunteer transition page shows the social sentence (R36); weak password refused; AUTH_005 → expired state, resend → "check your email"; web realm → `startSession`; mobile realm `{ realm: 'mobile', email }` → Open the app with that email and no session started (R17).
- [ ] `ConfirmEmail.test.tsx`: NGO → session and banner; mobile realm → "Email confirmed. Open the app" with the email in the deep link, no session (R17).
- [ ] `RegisterOrganization.test.tsx`: required fields including the statute PDF (a non-PDF refused by the `pdf` mode), free-text address (R6), Turnstile token sent, terms, password rule; ORG_004 409, ORG_006 and ORG_007 messages (R33); success screen.
- [ ] `OrganizationValidation.test.tsx`: hidden for plain admins; Validate and Suspend confirm → toast.
- [ ] `Team.test.tsx`: statuses, Send invite visibility, no Disable on yourself, Enable sends no invite (R20), confirm → toast.
- [ ] `useVisibleRoutes` hides super-admin-only entries (`roles?` on `IRoute`) from plain admins.
- [ ] The validation banner only while `validatedAt` is null.

## Done when

`npm run test` and `npm run lint` pass in `frontend/` locally and in CI.

## Comments
