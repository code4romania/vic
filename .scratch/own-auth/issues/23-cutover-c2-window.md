# C2 · Cutover: T-7 announcement, T-1 checks, the window, "VIC is back"

Status: ready-for-human
Type: task
Blocked by: 22, 21, 18
Tracker card: C2

Two people (backend + database; web, stores, OTA + communication) plus one on the checklist calling go / no-go. The smoke-test team works from the allow-listed network (`MAINTENANCE_ALLOWED_IPS`, R2). Rollback is complete until go / no-go; after maintenance is lifted problems are fixed forward. Where this file and the Guide differ, `../decisions.md` wins.

> **Updated 2026-11-23:** emailed links / codes instead of passwords (#514), app **2.0.0**, `users:finish-deletions` before `auth:migrate` (#687), one-off commands as `aws ecs run-task` (template and flag table in issue 22), and the Amplify / OTA details below.

## Before a date can be set

- [ ] Rehearsal (issue 22): two clean runs on a production copy, timings recorded, rollback drill done.
- [ ] #687 scope decided: finish **all** old deletions (`--apply` as is; hard-deletes their hours and contracts) or only the half-finished ones (`anonymized_profile`: add `--only-profiles` to both the dry run and `--apply`).
- [ ] terraform-ngohub: the VIC 2.0 changes on `develop` (#149 own auth, #151/#152 release tags) reach `main` with production values in the Terrakube production workspace (`vic_jwt_key_id`, Google client ids, Apple ids, `vic_mobile_min_version`, `vic_maintenance_mode`) and the production secret in Secrets Manager (`jwt_private_key`, `jwt_public_key`, `auth_token_key`, `apple_private_key`, `maintenance_allowed_ips`); production web `VITE_GOOGLE_CLIENT_ID` (issue 20).
- [ ] Mobile 2.0.0 production builds submitted to both stores, approved, held for manual release (issue 21).
- [ ] Apple: the new app is signed by the same Apple team as the Cognito Apple federation ("Hide my email" addresses must match); the sending domain is registered under Sign in with Apple > Email sources, or relay users get no VIC email (issue 00).
- [ ] Email: SPF / DKIM / DMARC passing for the `MAIL_FROM` domain; SES sending limit enough for the all-user mailings at 10/s (issue 21).
- [ ] Privacy policy and terms updated (issue 21); NGO Hub agrees to switch its VIC link on the day (issue 00).
- [ ] The date, the 2–4 hour window and the smoke-test networks for `MAINTENANCE_ALLOWED_IPS` (issue 00).

## T-7 and T-1

- [ ] Before T-7: the announce PR is deployed to production (issue 20, R3). Its image tag is the rollback image.
- [ ] T-7: `announce --template announce --date "..." --dry-run`, then real; it reads recipients from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`) and sends through the existing mail queue. Login notices live; store builds submitted and held.
- [ ] T-1: `announce --template reminder --date "..."` (dry run first); pre-flight SQL zero rows on production; production secrets applied (including `MAINTENANCE_ALLOWED_IPS`); `MOBILE_MIN_VERSION=2.0.0` ready for the window; previous backend image tag, web build and the VIC service's normal task count noted; NGO Hub ready; the OTA command and its production variables checked (`eas env:list --environment production`, issue 18).

## Window

**Amplify builds the production web from vic `main` on every push.** Merging `develop` into `main` deploys the new web at once, so the merge is a window step (0:45), not a preparation step; or switch off auto-build for `main` until then.

- **0:00 Maintenance on (R1).** Switch the web to its static maintenance page. Scale the VIC ECS service to 0 tasks; the shared ALB answers 503 for the VIC host. Scale only the VIC service, never the ALB (NGO Hub shares it). Take the database snapshot and write down its id; nothing proceeds without it.
- **0:15 Deploy the new backend**: tag `v2.0.0` on vic `main` (after the image build) and point the production `tag` in terraform-ngohub `locals.tf` at `2.0.0`, with `MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS` and `MOBILE_MIN_VERSION=2.0.0`, back to its normal task count. The migrations run on boot. From outside the allow-list `GET /public/health` is 200 and everything else 503 `MAINTENANCE`.
- **0:20 Finish old deletions (#687):** `finish-account-deletions` (dry run), check the count against the rehearsal, `--apply` per the recorded scope, dry run again → 0.
- **0:25 Import:** `migrate-identities --dry-run`, check the table against the rehearsal (social links must match the issue 00 count), real, again (0 created, 0 emails). Transition emails queued and held.
- **0:45 Web, stores, OTA:** merge vic `develop` into `main` (Amplify deploys the new web; outside the allow-list it shows the maintenance page); release the held store versions; publish the Update now OTA:
  `eas update --channel production --branch ota/update-now --message "Update now banner" --environment production`
  (all nine `EXPO_PUBLIC_*` production values must be in that environment, or the old app gets a bundle without an API URL or Cognito settings; `mobile/UPDATE-NOW.md` on the `ota/update-now` branch).
- **1:15 Smoke test** from the allow-listed network on web and phones: the rehearsal list (issue 22), including the regression pages Volunteers, Access requests, Access codes, Contracts and Activity log (R34).
- **1:45 Go / no-go.** No-go: restore the snapshot, redeploy the previous backend image with the old env vars at its normal task count and the previous web build (revert `main`, or redeploy the previous Amplify build), drop the queued emails. Nobody has been emailed. The OTA cannot be recalled: republish the previous update group on `production` (`eas update:list` → `eas update:republish --group <id>`), or publish an update from unchanged `main` with `--environment production`, so the next launch drops the banner. Note the previous group id at T-1.
- **2:00 Maintenance off:** `MAINTENANCE_MODE=false` and redeploy; check from a non-allow-listed network; log in once on web (link) and app (code). NGO Hub switches its link, `announce --release-transition` (`announce --status` until the queue is empty), `announce --template back` (dry run first), team channel post.

## Comments
