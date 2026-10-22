# W2 · Web: landing, login, forgot password, set password, confirm email

Status: needs-info
Type: task
Blocked by: 12, 09
Tracker card: W2

Outline until Layer 7 fixes the `/auth` routes and Layer 8 (issue 09) fixes the organization routes (R25). Forms follow `src/pages/EditOrganization.tsx` (react-hook-form + yup). No page ever says a login attempt sent an email. `../decisions.md` wins over this text and over the Guide.

- Routes in `src/routes/Router.tsx`: `/` renders `Landing.tsx` when logged out and the dashboard when logged in, with no `PublicRoute` wrapper on `/` (R29). `/login`, `/forgot-password`, `/register` under `PublicRoute`; `/set-password` and `/confirm-email` on a neutral route reachable while logged in; add a 404 route.
- `/login`: email + password, Forgot password, link to `/register`, notice until `VITE_MIGRATION_NOTICE_UNTIL`; maps AUTH_001–004; AUTH_003 offers "Resend the confirmation email" on `POST /auth/web/resend-verification`, which always answers 200 (R15); AUTH_012 → "This is a volunteer account", **Open the app** (`vic://login?email=`) and store links.
- `/set-password?token=`: read the token info first. Wording follows its `purpose`: `transition`, `invite`, `reset` or `verify_email` (R16; transition means an invite with no sender). For a volunteer's transition link the page repeats the email's sentence: "Set a password with this link, or sign in with Google, Facebook or Apple in the app as before." (R36). Web realm → `startSession`. Mobile realm: the answer is `{ realm: 'mobile', email }` and no session is created, so the page shows **Open the app** with `vic://login?email=<email>` and the store links (R17). Expired or used → "Send me a new link" (resend-token, always silent).
- `/confirm-email?token=`: NGO → session + validation banner; mobile realm → `{ realm: 'mobile', email }`, "Email confirmed. Open the app" with `vic://login?email=<email>` (R17). Expired or used → "Send me a new link" (resend-token, always silent).
- `PASSWORD_REGEX` copied to `src/common/constants/`; ro and en translations (`auth`, `landing` namespaces), one message per AUTH code.

## Comments
