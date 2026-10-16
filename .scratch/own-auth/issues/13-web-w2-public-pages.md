# W2 · Web: landing, login, forgot password, set password, confirm email

Status: needs-info
Type: task
Blocked by: 12
Tracker card: W2

Outline until Layer 7. Forms follow `src/pages/EditOrganization.tsx` (react-hook-form + yup). No page ever says a login attempt sent an email.

- Routes in `src/routes/Router.tsx`: `/` (`Landing.tsx`), `/login`, `/forgot-password`, `/register` under `PublicRoute`; `/set-password` and `/confirm-email` on a neutral route reachable while logged in; add a 404 route.
- `/login`: email + password, Forgot password, link to `/register`, notice until `VITE_MIGRATION_NOTICE_UNTIL`; maps AUTH_001–004; AUTH_012 → "This is a volunteer account", **Open the app** (`vic://login?email=`) and store links.
- `/set-password?token=`: wording per type (transition, reset, invite); web realm → `startSession`; mobile realm → "Open the app"; expired or used → "Send me a new link".
- `/confirm-email?token=`: NGO → session + validation banner; mobile → "Email confirmed. Open the app".
- `PASSWORD_REGEX` copied to `src/common/constants/`; ro and en translations (`auth`, `landing` namespaces), one message per AUTH code.

## Comments
