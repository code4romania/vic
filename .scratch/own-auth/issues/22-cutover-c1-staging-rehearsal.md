# C1 · Staging rehearsal: timed cutover runs, rollback drill, checklists, email review

Status: rehearsed locally (2026-11-06); staging rehearsal still ready-for-human
Type: task
Blocked by: 11, 15, 19, 20, 00
Tracker card: C1

Run the whole cutover on staging against a copy of production data until two consecutive clean runs. The timings set the production window (total plus 50 %). Record minutes per step under Comments. This is the first time anything from `feat/own-auth` runs outside a laptop (local first, `../decisions.md`). Where this file and the Guide differ, `../decisions.md` wins.

## Prepare

- [ ] Staging runs the current `main` backend and web plus the announce PR (issue 20), exactly as production will at T-1. Nothing from `feat/own-auth` is deployed yet.
- [ ] Restore the latest production snapshot into the staging database (same access rules as production; delete the copy after the rehearsal). Point staging's `MAIL_HOST` at a sink such as Mailpit.
- [ ] Staging secrets from issue 20 applied, including `MAINTENANCE_ALLOWED_IPS` with the smoke-test team's network.
- [ ] Builds: the 1.1.0 preview app against staging; one device on the old 1.0.19 preview build for the OTA check.
- [ ] Test accounts: a migrated admin, a migrated volunteer, a migrated social volunteer (Google or Apple test account), a throwaway NGO, one super admin set with `auth:super-admin`.
- [ ] `npm run announce -- --template announce --dry-run` against the copy: recipient count from the `user` table, deduplicated by `lower(email)`; sample rendered into the sink (R3).

## Run, with a stopwatch (same order as the window, R1, R2)

1. **Maintenance on.** Switch the web to the static maintenance page. Scale the VIC ECS service to 0 tasks; the shared ALB answers 503 for the VIC host. Scale only the VIC service, never the ALB (NGO Hub shares it).
2. **Snapshot** of the staging database; note its id.
3. **Pre-flight SQL** (`scripts/auth-preflight.sql`): zero rows, or fixed by hand.
4. **Deploy the new backend** with `MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS` set and `MOBILE_MIN_VERSION=1.1.0`, scaled back to its normal task count. The migration runs on boot; existing NGOs are active and validated. From a non-allow-listed network every route except `GET /public/health` answers 503 `MAINTENANCE`; from the allow-listed network the API answers normally.
5. **Dry run:** `npm run auth:migrate -- --dry-run`; counts as expected.
6. **Import:** `npm run auth:migrate`, then again; the second run reports 0 changes; transition emails queued and held.
7. **Deploy web, publish the OTA:** new web build (outside the allow-list it shows the maintenance message on 503); `eas update --channel staging --branch ota/update-now`.
8. **Smoke test** from the allow-listed network, on web and phones (list below). All green.
9. **Go / no-go** call, timed.
10. **Maintenance off, release:** `MAINTENANCE_MODE=false`, redeploy; check from a non-allow-listed network that the API answers 200. `npm run announce -- --release-transition`; emails flow into the sink at 10/s.
11. **Back announcement:** `npm run announce -- --template back --dry-run`; recipient count, sample rendered.

## Smoke test

Migrated admin: old password → 401 and nothing in the sink → transition link → set password → dashboard. Migrated volunteer on the 1.1.0 build: transition link in the phone browser → password → Open the app with the email filled → login. Forgot password in the app → code → new password → logged in. Social volunteer signs in with Google and Apple → old profile (R4). A volunteer on the web login → AUTH_012 → sent to the app. A new NGO registers with the statute and Turnstile, confirms, sees the banner, event creation refused, hidden in the app → super admin validates → visible, event allowed. Add admin and Send invite. A mobile token on `GET /volunteer` → 401. The old 1.0.19 device: login error, relaunch, Update now banner. Regression (R34): the Volunteers, Access requests, Access codes, Contracts and Activity log pages load and work for a migrated admin.

## Also once

- [ ] `npm run test:e2e` against the staging database after the import.
- [ ] Web browser checklist: landing → dashboard with a session; reload keeps the session; logout then back shows nothing private; forgot password end to end; the NGO registration appears in the app only after validation; the validation page hidden from a plain admin; Team add / invite / disable / enable; organization edit saves every field, the logo and the statute; the Volunteers, Access requests, Access codes, Contracts and Activity log pages (R34); no missingKey in ro or en.
- [ ] Device checklist from the Guide's Mobile section, per platform.
- [ ] Rollback drill: restore the snapshot from step 2, redeploy the previous backend image (the announce PR image) with the old env vars and the previous web build, scale the VIC service back to its normal count, log in through Cognito on staging. Time it; it is the no-go path.
- [ ] Review every rendered email in the sink (admin and volunteer transition emails, the volunteer one with the social sentence from R36; reset link, reset code, invite, mobile confirmation, NGO confirmation, new-NGO notice with the statute link, NGO validated, passwordChanged, announce, reminder, back) in ro and en; every link opens the right page; no onghub.com mention.

## Exit criteria

- [ ] Two consecutive clean runs with total time recorded.
- [ ] Both OTA isolation results recorded (issues 18, 19).
- [ ] Store build approved and held.
- [ ] No unresolved pre-flight rows against a fresh production copy.

## Comments

- 2026-11-06, local rehearsal (no staging; everything on this machine), database `vic_rehearsal` next to `vic`:
  - Before state: all migrations, then `OwnAuthTables` reverted (the pre-cutover schema), `scripts/auth-local-seed.sql` loaded (4 admins, 7 volunteers of which 1 deleted, 2 NGOs). Pre-flight (`auth-preflight.sql`): zero problem rows; logins: 3 email/password, 1 each Google / Facebook / Apple.
  - Deploy in maintenance (`MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS=203.0.113.7`, `MOBILE_MIN_VERSION=1.1.0`): `OwnAuthTables` ran on boot; both NGOs active + validated; `/public/health` 200; everything else 503 MAINTENANCE (mobile login included); the allow-listed IP via X-Forwarded-For passes.
  - `auth:migrate --dry-run` then real: 10 users read, 4 admins + 6 volunteers, 3 provider links, 1 deleted skipped, 10 transition emails held; a second run changes nothing. `announce --status` 10 paused; `--release-transition` → 10 emails in mailcatcher (Dana twice: admin and volunteer). Admin template asks to review the Team page; volunteer template has the update-the-app line and the R36 sentence; both say 30 days.
  - Maintenance off: old 1.0.x app (Cognito bearer, no x-app-version) → 401 (R22); x-app-version 1.0.19 → 426 AUTH_011.
  - Flows: Ana (admin) transition link → web set-password → dashboard, no validation banner; Team shows her active with last login, Bogdan "invite sent, expires in 30 days" sent by "VIC (noua autentificare)". Ioana (volunteer) transition link → set-password answers `{ realm: 'mobile', email }` → app via `vic://login?email=` → login → Home on her migrated profile. App search lists only the two validated NGOs; a pending NGO is hidden, also when searched by name.
  - Found: the local `mobile/android` project (gitignored, generated on the Expo branch) still said 1.0.19 / 22, so the dev build reported 1.0.19 and got 426 with MOBILE_MIN_VERSION=1.1.0. Regenerated with `npx expo prebuild --platform android --clean` → 1.1.0 / 23. EAS builds generate `android/` from app.config.ts, so release builds are not affected; local builds after a version bump need `prebuild --clean`. `expo prebuild` also staged the whole change set in git; unstaged again (files untouched).
  - Not covered locally: AWS/ALB scaling, the static web maintenance page, store releases, the OTA, the real NGO Hub switch.
