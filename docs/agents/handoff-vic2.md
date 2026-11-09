# VIC 2.0 handoff (2026-11-09)

Read `AGENTS.md` first. The scope is in the GitHub issues: tracking issue #464, and the work issues #466 to #514. This file says what is done, what is in progress and what is left, so the next person (or agent) can carry on without guessing.

## Branches (all on origin)

| Branch | Base | Status |
|---|---|---|
| `feat/own-auth` | main | Own authentication without Cognito (#514). Still **password based**, which is wrong for VIC 2.0; see `vic2/514-magic-link`. |
| `vic2/472-volunteer-statuses` | feat/own-auth | Done (#472). |
| `vic2/478-remove-id-card` | feat/own-auth | Done (#478). |
| `vic2/492-simplify-events` | feat/own-auth | Done (#492). |
| `vic2/503-announcement-entity` | feat/own-auth | Done (#503). |
| `vic2/integration` | feat/own-auth | feat/own-auth + the four branches above, merged. Phase 1 issue branches start here. |
| `vic2/514-magic-link` | feat/own-auth | **In progress**: backend done and tested, web and mobile not started. Not merged into `vic2/integration` yet. |

No PRs are open. Each done branch has its PR text ready (acceptance criteria and notes). Ask Laurentiu for it or rebuild it from the commit message.

Decision (team lead, 2026-11-09): VIC ships with its own login, converted to **magic link before release**. No passwords anywhere.

## #514 magic link: what is done (backend, `vic2/514-magic-link`)

- Web admins: `POST /auth/web/login/request {email}` → 204 always, and an email with a link to `{WEB_APP_URL}/login/link?token=…` (15 minutes, single use). An admin who never confirmed a new NGO gets the NGO confirmation link again instead, because that link is what activates the organization. A volunteer email on the web gets 409 `AUTH_012` (use the app).
- Web link page: `POST /auth/login-link {token}` → session (same response and `vic_refresh` cookie as before). It accepts login links, Team invites and the cutover "transition" links (all go to `/login/link`). Disabled login or suspended NGO → 403 `AUTH_004`. Used or expired → 400 `AUTH_005`.
- Mobile: `POST /mobile/auth/login/request {email}` → `{ maskedEmail }` and an email with a 6-digit code (15 minutes). An unknown email gets a login here, so **sign-up = login**; the profile form comes after (404 `USER_001` on `/mobile/user/profile`, as before). One code a minute (429 `AUTH_010`). Disabled → 403 `AUTH_004`.
- Mobile: `POST /mobile/auth/login/code {email, code}` → `{ accessToken, refreshToken, … }`. A wrong code is `AUTH_005`; the 5th wrong one ends the code (`AUTH_006`).
- Unchanged: `/mobile/auth/social`, refresh, logout, `/auth/web/me`, `/auth/confirm-email`, `/auth/token/:secret` (token info; new purpose `login`) and its `/resend`.
- **Removed**: web and mobile password login, `/mobile/auth/register`, forgot/reset/change password, `/auth/set-password`, mobile `resend-verification`, `PasswordService`, the lockout. NGO registration no longer takes `password`.
- Login status: `pending` (never logged in: invited, cutover, new sign-up) → `active` at the first login. The Team page "active" means "has logged in".
- Cutover (`auth:migrate`): admins get a 30-day login link; volunteers get an email with no link ("log in with your email in the updated app"), since the app uses codes.
- Migration `1794200000000-MagicLinkLogin`: drops `password_hash`, `password_set_at`, `failed_attempts` and `locked_until`; renames `pending_password` → `pending` and the token type `reset_password` → `login` (old reset tokens are deleted). Run, reverted and re-run on a local DB.
- Tests: backend unit 198/198 and e2e 72/72 (`npm run test:e2e`; needs local Postgres, Redis and the S3 emulator). The e2e helpers `asWeb(testApp, http, email)` and `asMobile(testApp, http, email)` log in through the real link and code flows.

## #514: what is left

### Web (`frontend/`)
1. `services/auth/auth.api.ts`: replace `login`, `forgotPassword`, `changePassword` and `setPassword` with `requestLogin(email)` (`POST /auth/web/login/request`) and `loginWithLink(token)` (`POST /auth/login-link`).
2. `contexts/auth/AuthContext(.Provider).tsx`: drop `login(email, password)`; the link page calls `startSession(result)` (it already exists).
3. `pages/Login.tsx`: email only → "check your email" state (with "send again"). Keep the `AUTH_012` OpenAppBox. Remove the password field, the "forgot password" link and the `AUTH_003` resend.
4. New `pages/LoginLink.tsx` on `/login/link?token=`: GET token info (show the NGO name for invites), then a **button** that posts the token. Do not consume it on page load: email scanners prefetch links. On `AUTH_005` show `ExpiredLink` (resend). Route `/set-password` → redirect to `/login/link`.
5. Delete `pages/SetPassword.tsx`, `pages/ForgotPassword.tsx` and their tests; remove the `/forgot-password` route.
6. `pages/RegisterOrganization.tsx`: remove the password and confirm-password fields (the API rejects nothing extra, but don't send them).
7. `pages/Team.tsx`, `services/team/team.api.ts`, `common/interfaces/*`: wording "set a password" → "log in"; `PASSWORD_REGEX` in `common/constants/patterns.ts` becomes unused.
8. Translations `assets/locales/{ro,en}`: login, link page, invite texts; remove the password strings.
9. Tests: `test/server.ts` (msw handlers), `Login.test.tsx`, `RegisterOrganization.test.tsx`, `services/api.test.ts`. Then `npm run lint && npm run build`.

### Mobile (`mobile/`)
1. `services/auth/auth.api.ts`: `requestLogin(email)` and `loginWithCode(email, code)`; remove register, login, forgot, reset and change password.
2. `contexts/auth/AuthContextProvider.tsx` and `AuthContext.ts`: same, storing tokens as the password login did.
3. Screens: `Login.tsx` becomes email → code (6 digits, "send again" after 60 s, show `AUTH_010` / `AUTH_006`). Delete `CreateAccount.tsx`, `ForgotPassword.tsx`, `ConfirmPassword.tsx` and `ChangePassword.tsx`; remove them from `routes/Public.tsx`, `routes/Private.tsx`, `routes/linking.ts` and `Settings.tsx`. Keep the Google/Apple buttons.
4. After the code login: no profile (404 `USER_001`) → `CreateUser`, as today.
5. Optional later: a deep link from the code email into the app (needs universal links; the code alone is enough for release).
6. `npm run lint`, `npx tsc --noEmit`, `npx jest`; test on a dev build (not Expo Go).

### After web and mobile
- Merge `vic2/514-magic-link` into `feat/own-auth`, then merge `feat/own-auth` into `vic2/integration` again. Expected conflict: `backend/src/usecases/user/create-regular-user.usecase.ts` and `regular-user.model.ts` (#472 Candidate claim + #478 optional phone). Keep all three behaviours.
- Note: on `vic2/integration`, mobile `POST /mobile/user` requires `birthday` (#478); the e2e profile fixtures already send it.

## Gotchas
- `migration:generate` reads `dist/**/*.entity.js`; run `npm run build` first, or write migrations by hand (all VIC 2.0 migrations were hand-written and round-tripped).
- e2e test databases (`vic_test_N`) keep the schema of the last branch that ran them. After switching branches, drop them (`drop database "vic_test_1" with (force)` …) and run `npm run build`.
- `frontend` `npm run lint` also lints a local `dist/`; use `npx eslint src` or delete `dist/`.
- `mobile/.env.development` points at staging; for local runs use `mobile/.env.development.local` with `EXPO_PUBLIC_API_URL=http://<LAN-IP>:4001`.

## VIC 2.0: rest of the scope
- Waiting on the client (`needs-info`): #488 contract statuses, #508 data and account security (what 2FA means with magic link), #510 NGO registration with CUI/RNONG.
- #512 Google/Apple: needs the Google Cloud and Apple Developer access listed in the issue; remove Facebook then.
- #513 mobile builds: needs EAS and store access.
- Phase 1 (branch from `vic2/integration`, one issue per PR):
  - Not tied to login: #474, #475, #476, #481, #482, #483, #493 to #497, #501, #504.
  - Wait for #514 web/mobile: #471 (invite email for Active), #507, #511.
- Open questions in the done PRs: #472, what a Candidate who later creates an account sees on mobile; #492, whether "Public" stays as an event target.
