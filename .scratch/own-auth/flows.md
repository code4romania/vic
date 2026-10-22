# How login works after the switch, and how we get there

This is a plain walk-through of every login flow and of the switch from Cognito and NGO Hub to VIC's own login. The [overview with diagrams](https://claude.ai/artifact/53tayCyzL6u5FEFnMGyVw7) is the short version; the detail lives in the [Implementation Guide](https://claude.ai/code/artifact/02645619-109a-4538-9358-b61ffb680134) and the issue files. Where this file, the Guide or the design doc differ, `decisions.md` wins: it records every decision since 6 October 2026 and how each review finding was resolved (R1 to R36).

The scope is replacing Cognito and NGO Hub, nothing more. Volunteers have never come from NGO Hub; an "Add volunteer" button on the web is a separate feature for after the switch.

## The pieces

- **Login (identity).** One row in `auth_identity` per email per app: `web` for NGO admins, `mobile` for volunteers. It holds the password hash (argon2id), a status (`pending_password`, `active`, `disabled`) and a link to the existing `user` row.
- **Session.** When someone logs in they get two tokens.
  - The **access token** lasts 15 minutes and goes on every request.
  - The **refresh token** gets a new access token. It lasts 7 days on the web, where it sits in an httpOnly cookie, and 30 days in the app, where it sits in secure storage. Each use replaces it. If an old refresh token is used twice, every session of that login ends.
- **One-time link.** Every email that needs an action carries a personal link (`/set-password?token=…` or `/confirm-email?token=…`). Only a hash of it is stored, and it works once. The one exception is Forgot password started in the app, which emails a 6-digit code.
- **Lockout.** Five wrong passwords lock the login for 15 minutes.

## Flows for NGO admins (web)

1. **Log in.** Email and password go to `POST /auth/web/login`. The admin gets the access token, and the refresh cookie is set.
   - Wrong password, or no password set yet: "wrong email or password" (AUTH_001). Login never sends an email.
   - Email not confirmed yet: AUTH_003.
   - Login disabled: AUTH_004.
   - Volunteer email on the web: AUTH_012, and the page sends them to the app.
2. **Stay logged in.** When the access token expires, the web app quietly calls `POST /auth/web/refresh` with the cookie and retries the request.
3. **Forgot password.** The admin enters an email and the page always says "if the account exists, we've sent a link". The link is valid for 1 hour and opens the set-password page. After setting a password they're logged in and their other sessions end.
4. **Register a new NGO.** A form takes VIC's seven fields, the tax ID (CUI), the statute PDF and a Turnstile check. It creates the organization as `pending` together with its first admin, and sends a confirmation link valid for 24 hours. When the link is clicked, the NGO becomes active, the admin is logged in, and the super admins get an email with the statute.
5. **Validation.** Until a super admin validates it, the NGO is hidden from the app, can't create events and can't log hours. A super admin validates it on a page only they see. Suspending an NGO stops all its admins from logging in (AUTH_004) without changing their own status, so unsuspending simply lets them back in.
6. **Team page.** An admin can add another admin, which sends an invite link valid for 14 days. They can also resend an invite, or disable and re-enable a colleague. Re-enabling sends no email; a re-enabled colleague with no password gets one through Send invite.
7. **Change password.** The admin gives the current and the new password. Their other sessions end.

## Flows for volunteers (mobile app)

1. **Sign up.** Email, password and phone go to `POST /mobile/auth/register`. A confirmation link valid for 24 hours is emailed. The volunteer opens it in the phone's browser, the page opens the app through `vic://`, and they log in and create their profile as today.
2. **Log in.** Email and password get both tokens, stored in secure storage. The errors are the same as on the web.
3. **Google, Facebook or Apple.** The app gets a token from the provider and sends it to `POST /mobile/auth/social`. The backend checks it with the provider. It then finds the login by the provider link or by the verified email, or creates one, and logs the volunteer in. No password is set, so Forgot password still works later.
4. **Stay logged in.** On a 401, the app calls `POST /mobile/auth/refresh` once and retries.
5. **Forgot password.** A 6-digit code is valid for 15 minutes. Five wrong tries end the code. A correct code plus the new password logs the volunteer in.
6. **Old app version.** A new-style app older than the minimum version (it sends `x-app-version`) gets 426 and shows an "Update the app" screen. Today's 1.0.x app sends no version header; its Cognito tokens simply get 401, and the "Update now" banner tells those users to update. During maintenance the new app gets 503 and shows a "VIC is being updated" screen.

## Flow for everyone who exists today (the transition)

1. Cognito never exports password hashes, so no password can move over.
2. At the switch, `auth:migrate` creates one login per existing user, with no password (`pending_password`). It queues one email per person with a personal link valid for 30 days. The admin version also asks them to review their Team page.
3. The emails are held until the switch is done, so a rollback emails nobody.
4. **Admin:** opens the link, sets a password and is logged in on the web.
5. **Volunteer:** opens the link, sets a password, then taps Open the app, which opens Login with their email filled in, and logs in there. The email says they can instead sign in with Google, Facebook or Apple in the app as before; any volunteer may do that, and social sign-in on a migrated login makes it active.
6. Trying the old password fails with no email sent. After 30 days the link is dead, but Forgot password works because the login exists.

## How the switch happens

The work runs on three stages, one after another. Nothing reaches production until the last one.

| Stage | Where | Data | What runs |
| --- | --- | --- | --- |
| 1. Build and test | Your machine, `docker compose up db` | Seeded test data only | Every layer's migration, run, revert, run again; unit and e2e tests; `auth:migrate` on seeded users |
| 2. Rehearsal | Staging | A copy of the production snapshot, emails to a sink (Mailpit) | The whole cutover with a stopwatch, twice clean in a row, plus the rollback drill |
| 3. Cutover window | Production | Real data, snapshot first | The rehearsed steps once |

Before the window:

- **Announce PR, before T-7.** A small PR to `main` with no migration and no auth change adds an `announce` command. It reads recipients from the `user` table (not deleted, one per email ignoring case) and sends through the existing mail queue. It is the only thing merged and deployed before the rehearsal.
- **T-7** the announce email, **T-1** the reminder, both from that command.

The window, in short:

1. **Maintenance on.** The old backend has no maintenance switch, so the web switches to its static maintenance page and the VIC service on AWS is scaled to 0 tasks. The shared load balancer then answers 503 for VIC. Only the VIC service is scaled, never the load balancer, because NGO Hub uses it too.
2. Take a database snapshot and write down its id.
3. Deploy the new backend in maintenance mode (`MAINTENANCE_MODE=true`). The migration runs on boot. The backend answers 503 to everyone except an allow-list of IP addresses (`MAINTENANCE_ALLOWED_IPS`): the networks the smoke-test team works from.
4. Run `auth:migrate`: a dry run, then for real, then once more to check that it reports 0 changes. The transition emails are queued and held.
5. Deploy the web, release the new app in the stores, and publish the "Update now" banner to the old app. Everyone outside the allow-list still sees maintenance.
6. Smoke test from the allow-listed network, on web and phones, with test accounts. It includes the pages that should not have changed: Volunteers, Access requests, Access codes, Contracts and Activity log.
7. Go or no-go. On no-go, restore the snapshot and redeploy the old backend and web. Nobody has been emailed.
8. On go, turn maintenance mode off, release the transition emails and send "VIC is back". From here problems are fixed forward.

The staging rehearsal runs exactly these steps, twice clean in a row.

## Local first: how migrations are run (decided 21 October 2026)

- **Migrations run only against the local database until the staging rehearsal.** That means `npm run migration:run`, `migration:revert` and `migration:run` again against `docker compose up db`.
- **Nothing from `feat/own-auth` is merged to `main` or deployed before the rehearsal**, not even Layers 0 to 2. The only exception is the announce PR above, which has no migration. The backend has `migrationsRun: true` (`typeorm-config.service.ts:20`), so any deployed image that contains a migration applies it on boot.
- **Every migration has a working `down()`**, and run, revert, run is part of each layer's done check.
- **Local data is seeded, never a production dump.** Seed admins, volunteers, a social-style user (`cognito_id` like `google_…`), duplicate emails that differ only in case or spaces, and an admin with no organization.
- **The pre-flight SQL is read-only.** It can run on a production copy at any time; it changes nothing.
- **The first non-local run is the staging rehearsal**, on a snapshot copy, with emails going to a sink. Production is touched only in the window, after its snapshot.
