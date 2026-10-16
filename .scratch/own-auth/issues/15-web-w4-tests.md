# W4 · Web tests: Vitest + Testing Library + MSW

Status: needs-info
Type: test
Blocked by: 13, 14
Tracker card: W4

The web app has no test runner today. Setup: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`; `test` config in `vite.config.ts`; `src/test/server.ts` faking `/auth/*`, `/organization/team`, `/organizations/register`, `/admin/organizations/*`. Specs as tracker card W4 (api refresh-once, AuthContextProvider, Landing, Login incl. AUTH_012, SetPassword, ConfirmEmail, RegisterOrganization, OrganizationValidation, Team, banner).

## Comments
