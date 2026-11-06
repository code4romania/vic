# W2 · Web: landing, login, forgot password, set password, confirm email

Status: done locally (2026-11-06)
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

- 2026-11-06: built and tested locally, no PR.
  - Routes: `src/routes/RootRoute.tsx` replaces `PrivateRoute` on `/`: logged in → `MainLayout`; logged out → `Landing` on `/` itself, `/login` (with `from`) on any private path (R29). `/forgot-password` under `PublicRoute`; `/set-password`, `/confirm-email` neutral; `*` → `NotFound.tsx`.
  - New: `Landing.tsx`, `ForgotPassword.tsx`, `SetPassword.tsx`, `ConfirmEmail.tsx`, `NotFound.tsx`; shared `layouts/AuthLayout.tsx`, `components/OpenAppBox.tsx` (vic:// on phones only, store links), `components/ExpiredLink.tsx` (resend-token, always ends in "check your email"), `common/utils/auth-error.ts`. `PASSWORD_REGEX` in `src/common/constants/patterns.ts`. Login.tsx moved onto the shared pieces (Login itself was pulled into W1).
  - `/set-password` with a `verify_email` token redirects to `/confirm-email`. ConfirmEmail calls the API once (ref guard against StrictMode's double effect, the link is single use).
  - Translations: `forgot_password`, `set_password`, `confirm_email`, `landing`, `not_found`, `auth.open_app`, `auth.expired_link`, ro + en.
  - Backend bug found: the exception filter spread a string response, so the throttler's 429 answered `{"0":"T","1":"h",...}` with no `code_error`. Fixed in `src/infrastructure/filters/exception.filter.ts` (+ `exception.filter.spec.ts`); the web reads any 429 without a code as AUTH_010.
  - Browser check (Vite 5173, API 4001): `/` dashboard logged in, landing logged out; `/nope` 404; `/organization` logged out → /login. Forgot password (ana.admin) → mailcatcher reset link → weak password refused → saved → session → dashboard; same link again → expired state. Links inserted directly in `auth_token` (HMAC with the base64-decoded `AUTH_TOKEN_KEY`): volunteer transition (elena) → "VIC are o nouă autentificare" + the R36 sentence → saved → "Gata. Deschide aplicația" + store links, no session; Team invite (dana.both, sent by ana) → "Bine ai venit în Fundatia Seed Doi"; mobile verify (florin) → "Email confirmat. Deschide aplicația"; reopened → expired → resend → "check your email". No console errors.
  - Local test password set for ana.admin@seed.test and elena@seed.test (mobile): `Vic-Local-Test1!`.
  - Not covered yet: NGO confirm-email → session + banner (needs W3 registration).

