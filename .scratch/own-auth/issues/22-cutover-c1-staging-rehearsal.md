# C1 · Staging rehearsal: timed cutover runs, rollback drill, checklists, email review

Status: rehearsed locally (2026-11-06); the two scripts rehearsed on staging (2026-11-23); full staging rehearsal on a production copy still ready-for-human
Type: task
Blocked by: 11, 15, 19, 20, 00
Tracker card: C1

Run the whole cutover on staging against a copy of production data until two consecutive clean runs. The timings set the production window (total plus 50 %). Record minutes per step under Comments. Where this file and the Guide differ, `../decisions.md` wins.

> **Updated 2026-11-23** for what changed after this plan was written: login is by emailed link (web) and emailed code (app), with no passwords (#514); NGO registration uses a self-declaration instead of the statute (#510); Turnstile and Facebook are gone (only Google and Apple remain); the new app is **2.0.0**; the old store apps are **1.0.20 (iOS) and 1.0.19 (Android)**, both Expo SDK 51; ECS exec is off for VIC, so one-off commands run as `aws ecs run-task` (template below); `users:finish-deletions` (#687) must run before `auth:migrate`.

## Running one-off commands

ECS exec is not enabled on the VIC service (`enable_execute_command` is not set in `service_vic.tf`). Run each command as a one-off task with the service's task definition and network, and read the output in CloudWatch:

```
aws ecs run-task --cluster ngohub-<env> --launch-type FARGATE \
  --task-definition vic-<env> \
  --network-configuration '<same subnets and security group as the vic-<env> service>' \
  --overrides '{"containerOverrides":[{"name":"vic-<env>","command":["node","dist/commands/<command>.command.js", ...flags]}]}'
```

The two data commands default in **opposite** directions; copy them exactly:

| Command | Dry run | Real run |
|---|---|---|
| `finish-account-deletions` (#687) | no flag (default) | `--apply` |
| `migrate-identities` (`auth:migrate`) | `--dry-run` | no flag (default) |

Never run `announce --release-transition` (or `--template announce/reminder/back` without `--dry-run`) anywhere but production: staging sends through SES to real addresses.

## Prepare

- [ ] Staging runs the current production backend and web (`main`, 1.1.0) plus the announce PR (issue 20), exactly as production will at T-1. Nothing from VIC 2.0 is deployed yet.
- [ ] Restore the latest production snapshot into the staging database (same access rules as production; delete the copy after the rehearsal). **Staging itself was already migrated on 2026-11-23**, so this restore is step 0 of every rehearsal run. Point staging's `MAIL_HOST` at a sink such as Mailpit.
- [ ] Staging secrets from issue 20 applied, including `MAINTENANCE_ALLOWED_IPS` with the smoke-test team's network.
- [ ] Builds: the **2.0.0** preview app against staging on one iPhone and one Android phone; one device on an old **SDK 51** preview build for the Update now OTA check (issue 18).
- [ ] Test accounts on the production copy: a migrated admin, a migrated volunteer, a migrated Google volunteer and a migrated Apple volunteer (with a "Hide my email" address), a throwaway NGO, one super admin set with `auth:super-admin`.
- [ ] `announce --template announce --date YYYY-MM-DD --dry-run` against the copy: recipient count from the `user` table, deduplicated by `lower(email)`; sample rendered into the sink (R3).
- [ ] Social users on the copy, to compare with `auth:migrate`'s "social provider links" (issue 00):
  `SELECT split_part(cognito_id, '_', 1), count(*) FROM "user" WHERE type = 'regular' AND deleted_on IS NULL GROUP BY 1`

## Run, with a stopwatch (same order as the window, R1, R2)

1. **Maintenance on.** Switch the web to the static maintenance page. Scale the VIC ECS service to 0 tasks; the shared ALB answers 503 for the VIC host. Scale only the VIC service, never the ALB (NGO Hub shares it).
2. **Snapshot** of the staging database; note its id.
3. **Pre-flight SQL** (`backend/scripts/auth-preflight.sql`): zero rows, or fixed by hand.
4. **Deploy the new backend** (vic release tag, terraform-ngohub `locals.tf`) with `MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS` set and `MOBILE_MIN_VERSION=2.0.0`, scaled back to its normal task count. The migrations run on boot (`RUN_MIGRATIONS` is not set, so it defaults to true). From a non-allow-listed network every route except `GET /public/health` answers 503 `MAINTENANCE`; from the allow-listed network the API answers normally.
5. **Finish old deletions (#687):** `finish-account-deletions` (dry run), check the list, then `--apply`; run the dry run once more: `0 unfinished deletion(s)`. Use the production decision on scope (see below).
6. **Import:** `migrate-identities --dry-run`, check the table, then the real run, then once more: the third run reports 0 created and 0 emails. Transition emails are queued and **held**.
7. **Deploy web, release the stores, publish the OTA:** new web build (outside the allow-list it shows the maintenance page on 503); `eas update --branch staging --clear-cache` from the `ota/update-now` branch with the staging variables (issue 18, `mobile/UPDATE-NOW.md` on that branch); undo afterwards with `eas update:roll-back-to-embedded --branch staging --runtime-version exposdk:51.0.0`.
8. **Smoke test** from the allow-listed network, on web and phones (list below). All green.
9. **Go / no-go** call, timed.
10. **Maintenance off, release:** `MAINTENANCE_MODE=false`, redeploy; check from a non-allow-listed network that the API answers 200. `announce --release-transition`; emails flow into the sink at 10/s. `announce --status` shows the queue empty.
11. **Back announcement:** `announce --template back --dry-run`; recipient count, sample rendered.

### Expected output (staging, 2026-11-23, for comparison)

```
finish-account-deletions          43 unfinished deletion(s)  (2 anonymized_profile, 41 anonymized_user)
finish-account-deletions --apply  erased: 43, failed: 0
migrate-identities --dry-run      169 read · 46 admins · 116 volunteers · 0 social · 7 unchanged
                                  46 deleted skipped · 0 no email · 0 duplicates · 162 emails (would be held)
migrate-identities                same numbers, 162 transition emails held
```

`anonymized_user` rows are accounts deleted by the old code (renamed "Deleted", soft deleted); `--apply` erases them with today's rules, which **hard-deletes their volunteer records, hours, contracts (and the PDFs) and event registrations**. `anonymized_profile` rows are the half-finished deletions of #687 (still shown as Activ). On production, decide before `--apply` whether to finish all of them or only `anonymized_profile` (`--only-profiles`, on both the dry run and `--apply`), and record the decision here.

## Smoke test

- **Migrated admin (web):** the old password form is gone; enter the email on the login page → "Trimite linkul de autentificare" → the link in the sink → dashboard. The transition email's link (30 days) also logs in. Team page: the admin is Activ with last login; other migrated admins show their pending link.
- **Migrated volunteer (app 2.0.0):** enter the email → 6-digit code in the sink → Acasă on the old profile (hours, organizations, documents). Logout and log in again with a new code.
- **Social volunteers:** Google on Android and iOS, Apple on iOS (also a "Hide my email" address) → the old profile, no duplicate account (R4, R35). Apple only works if the new app is signed by the same Apple team as the Cognito federation (issue 00).
- **A volunteer on the web login** → AUTH_012 ("use the mobile app").
- **A new NGO** registers with the self-declaration, confirms its email, sees the "awaiting validation" banner, event creation refused, hidden in the app search → super admin validates → "organizație validată" email, visible in the app, event allowed.
- **Team:** add an admin and send the invite → the invite link logs them in; re-send is limited to one per 10 minutes; disable → logged out at the next request; enable again.
- **Old apps:** a device on the old SDK 51 build gets 401 (no `x-app-version`, R22); after the OTA it shows the "Actualizează aplicația VIC" banner on the second launch and the button opens the store. A 2.0.0 build does not receive the OTA.
- **Pushes on both phones:** join request approved / rejected, hours approved / rejected, added to an event, new event, contract uploaded (#719); each tap opens the right screen with fresh data (#691, #711, #720).
- **Regression (R34):** Volunteers, Access requests, Access codes, Contracts and Activity log load and work for a migrated admin; an upload, an export and a PDF report each work once.

## Also once

- [ ] `npm run test:e2e` against the staging database after the import.
- [ ] Web browser checklist: landing → dashboard with a session; reload keeps the session; logout then back shows nothing private; login link end to end (request, email, expiry "Linkul nu mai este valabil"); the NGO registration appears in the app only after validation; the validation page hidden from a plain admin; Team add / invite / disable / enable; organization edit saves every field, the logo and the locked CUI (#717); the regression pages (R34); no missingKey in ro or en.
- [ ] Device checklist from the Guide's Mobile section, per platform.
- [ ] Rollback drill: restore the snapshot from step 2, redeploy the previous backend image (the announce PR image) with the old env vars and the previous web build, scale the VIC service back to its normal count, log in through Cognito on staging. Time it; it is the no-go path.
- [ ] Review every rendered email in the sink, in ro and en, against `backend/src/modules/auth/constants/auth-emails.ts`: `transitionLinkAdmin`, `transitionLinkVolunteer` (with the Google / Apple sentence, R36), `volunteerInvitation`, `loginLink`, `loginCode`, `inviteLink`, `confirmOrganizationLink`, `organizationRegistered` (name, CUI, link only, #710), `organizationValidated`, `announce`, `reminder`, `back`; plus the notification emails (hours, events, contract uploaded). Every link opens the right page; no password wording; no onghub.com mention.

## Exit criteria

- [ ] Two consecutive clean runs with total time recorded.
- [ ] Both OTA isolation results recorded (issue 18).
- [ ] Store build 2.0.0 approved and held.
- [ ] No unresolved pre-flight rows against a fresh production copy.
- [ ] The #687 scope decision recorded.

## Comments

- 2026-11-06, local rehearsal (no staging; everything on this machine), database `vic_rehearsal` next to `vic`. This ran before the switch to emailed links (#514); the flows below used passwords and are kept as history only.
  - Before state: all migrations, then `OwnAuthTables` reverted (the pre-cutover schema), `scripts/auth-local-seed.sql` loaded (4 admins, 7 volunteers of which 1 deleted, 2 NGOs). Pre-flight (`auth-preflight.sql`): zero problem rows; logins: 3 email/password, 1 each Google / Facebook / Apple.
  - Deploy in maintenance (`MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS=203.0.113.7`, `MOBILE_MIN_VERSION=1.1.0`): `OwnAuthTables` ran on boot; both NGOs active + validated; `/public/health` 200; everything else 503 MAINTENANCE (mobile login included); the allow-listed IP via X-Forwarded-For passes.
  - `auth:migrate --dry-run` then real: 10 users read, 4 admins + 6 volunteers, 3 provider links, 1 deleted skipped, 10 transition emails held; a second run changes nothing. `announce --status` 10 paused; `--release-transition` → 10 emails in mailcatcher (Dana twice: admin and volunteer). Admin template asks to review the Team page; volunteer template has the update-the-app line and the R36 sentence; both say 30 days.
  - Maintenance off: old 1.0.x app (Cognito bearer, no x-app-version) → 401 (R22); x-app-version 1.0.19 → 426 AUTH_011.
  - Found: the local `mobile/android` project (gitignored) can keep an old version after a bump; local builds after a version bump need `npx expo prebuild --clean`. EAS builds generate `android/` from app.config.ts, so release builds are not affected.
  - Not covered locally: AWS/ALB scaling, the static web maintenance page, store releases, the OTA, the real NGO Hub switch.
- 2026-11-23, the two data commands on staging (staging DB, not a production copy; run in the API container):
  - `finish-account-deletions`: 43 found (2 `anonymized_profile` = the #687 accounts, 41 `anonymized_user` = old completed deletions); `--apply`: erased 43, failed 0.
  - `migrate-identities --dry-run` and real: identical tables (see Expected output). 0 social links because staging's Google / Apple users had already been linked at login by #672; production will not be 0.
  - Staging is now migrated; the next rehearsal starts from a restored production copy.
