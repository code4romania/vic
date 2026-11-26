# C2 · Cutover: T-7 announcement, T-1 checks, the window, "VIC is back"

Status: ready-for-human
Type: task
Blocked by: 22, 21, 18
Tracker card: C2

Two people (backend + database; web, stores, OTA + communication) plus one on the checklist calling go / no-go. The smoke-test team works from the allow-listed network (`MAINTENANCE_ALLOWED_IPS`, R2). Rollback is complete until go / no-go; after maintenance is lifted problems are fixed forward. Where this file and the Guide differ, `../decisions.md` wins.

> **Updated 2026-11-23:** emailed links / codes instead of passwords (#514), app **2.0.0**, `users:finish-deletions` before `auth:migrate` (#687), one-off commands as `aws ecs run-task` (template and flag table in issue 22), and the Amplify / OTA details below.
>
> **Updated 2026-11-25:** the `v2.0.0` tag and image move to T-1 (main only gets develop at 0:45); terraform-ngohub develop → main is prepared ahead but merged and applied only at 0:15; migrations on boot with exactly one task; super admin after the import; backups beyond the snapshot, production test accounts, the S3 files #687 deletes, the PDF viewer (#724–#727) and the two languages (#732).

> **Updated 2026-11-26 (plan sent to the client for approval):** the cutover is the night of **30 Nov → 1 Dec 2026**, 00:00–02:00 (`--date 2026-12-01`). The 2.0 store builds are **not** reviewed before the window: they are uploaded (TestFlight, Play internal as draft) and submitted for review the morning after go, so the reviewers test against the live backend. The old store app keeps working meanwhile (#740, `LEGACY_MOBILE_UNTIL` = launch + 30 days). So at go only the web changes for users; the store release, the Update now OTA and the volunteers' "new app" email and push happen on **store day** (below).

## Before a date can be set

- [ ] Rehearsal (issue 22): two clean runs on a production copy, timings recorded (including how long the migrations take on boot), rollback drill done.
- [ ] #687 scope decided: finish **all** old deletions (`--apply` as is; hard-deletes their hours and contracts) or only the half-finished ones (`anonymized_profile`: add `--only-profiles` to both the dry run and `--apply`).
- [ ] #687 files: `--apply` deletes contract PDFs from S3 and the private bucket has no versioning, so a no-go after 0:20 restores rows whose files are gone. Copy those files first, switch versioning on before the window, or accept it (much smaller with `--only-profiles`).
- [ ] terraform-ngohub: the PR `develop` → `main` (#149 own auth, the staging release tags) is **prepared and reviewed, not merged**. `service_vic.tf` on develop removes `COGNITO_*` and `ONG_HUB_API` from the VIC task and the Cognito `VITE_*` values from Amplify, so applying it while 1.1.0 runs breaks the old login. It is merged and applied at 0:15. A production `terraform plan` (no apply) is read before the date: develop is ~150 commits ahead of main and also brings the PDF generator lambda, the AWS provider update, Cognito lambdas on Node 24, ECS IAM changes, `service_ngohub.tf`, `sentry_dsn_vic` and Redis `noeviction` on the cluster shared with NGO Hub.
- [ ] Terrakube production workspace values, set ahead but only used by the 0:15 apply: `vic_jwt_key_id`, `vic_google_client_ids`, `vic_google_web_client_id`, `vic_apple_bundle_id`, `vic_apple_services_id`, `vic_apple_team_id`, `vic_apple_key_id`, `vic_mobile_min_version`, `vic_maintenance_mode`, `vic_migration_notice_until`, `vic_app_store_url` (`https://apps.apple.com/ro/app/vic/id6474194051`; the default is empty and the web notice then has no iOS link), `sentry_dsn_vic`. Production secret in Secrets Manager: `jwt_private_key`, `jwt_public_key`, `auth_token_key`, `apple_private_key`, `maintenance_allowed_ips` (issue 20, `backend/docs/auth.md`).
- [ ] Mobile `production` profile in `mobile/eas.json`: the production `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (`app.config.ts` stops a production build without them) and `EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL` (without it Login shows no notice). Needs the date.
- [ ] Mobile 2.0.0 production builds submitted to both stores, approved, held for manual release (issue 21). Built from a commit that has the PDF viewer (#727 adds native code: react-native-pdf); otherwise the viewer ships later as 2.0.1 with a new runtime.
- [x] Production super admin chosen: `maria.leustean@commitglobal.org` (decided 26 Nov 2026; she is an admin of Asociatia Code for Romania in production 1.x, so the import gives her a web identity).
- [ ] Web during 0:00–0:45: the static maintenance page (R1) does not exist yet and Amplify has no steps for it. Build it, or accept that the old web shows errors for 45 minutes.
- [ ] Smoke-test accounts in **production 1.1.0**, so the import migrates them: an old admin, an old volunteer, a Google volunteer, an Apple "Hide my email" volunteer. Plus a throwaway NGO, deleted after the smoke test.
- [ ] Who holds the store accounts and who can scale the ECS service and apply in Terrakube during the window.
- [ ] Apple: the new app is signed by the same Apple team as the Cognito Apple federation ("Hide my email" addresses must match); the sending domain is registered under Sign in with Apple > Email sources, or relay users get no VIC email (issue 00).
- [ ] Email: SPF / DKIM / DMARC passing for the `MAIL_FROM` domain; SES sending limit enough for the all-user mailings at 10/s (issue 21).
- [ ] Privacy policy and terms updated (issue 21); NGO Hub agrees to switch its VIC link on the day (issue 00).
- [ ] The date, the 2–4 hour window and the smoke-test networks for `MAINTENANCE_ALLOWED_IPS` (issue 00).

## T-7 and T-1

- [ ] Before T-7: the announce PR is deployed to production (issue 20, R3). Its image tag is the rollback image.
- [ ] T-7: `announce --template announce --date YYYY-MM-DD --dry-run`, then real; it reads recipients from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`) and sends through the existing mail queue. Login notices live; store builds uploaded (TestFlight, Play internal as draft), **not** submitted for review.
- [ ] T-1, the backend image: tag **`v2.0.0` on the vic `develop` commit that passed the rehearsal** (not on `main`, which only gets develop at 0:45). The tag starts `build-image.yml`; check that `vic:2.0.0` is in ECR before the window. Staging runs that commit as the last `v2.0.0-rc.N`.
- [ ] T-1, backups beyond the snapshot (`backend/docs/deploy-production.md` §1–2): a `pg_dump` kept outside the AWS account, a listing of the S3 buckets, and a CSV of the announcements sent to departments (after the migration they reach the whole organization; tell the affected NGOs).
- [ ] T-1: `announce --template reminder --date YYYY-MM-DD` (dry run first); pre-flight SQL zero rows on production; production secrets applied (including `MAINTENANCE_ALLOWED_IPS`); `MOBILE_MIN_VERSION=2.0.0` ready for the window; previous backend image tag, web build and the VIC service's normal task count noted; NGO Hub ready; the OTA bundle exported locally (`npx expo export --platform android --clear`) with all nine production values and checked (issue 18: eight of them are EAS **secret** variables, not readable by `eas update` on a laptop; get the values, make them sensitive, or publish from an EAS Workflow).

## Window

**Amplify builds the production web from vic `main` on every push.** Merging `develop` into `main` deploys the new web at once, so the merge is a window step (0:45), not a preparation step; or switch off auto-build for `main` until then.

- **0:00 Maintenance on (R1).** Switch the web to its static maintenance page. Scale the VIC ECS service to 0 tasks; the shared ALB answers 503 for the VIC host. Scale only the VIC service, never the ALB (NGO Hub shares it). Take the database snapshot and write down its id; nothing proceeds without it.
- **0:15 Deploy the new backend**: merge the prepared terraform-ngohub PR `develop` → `main` with the production `tag` in `locals.tf` pointing at `2.0.0` (the image built at T-1), `vic_maintenance_mode = true`, `maintenance_allowed_ips`, `vic_mobile_min_version = 2.0.0` and `vic_legacy_mobile_until` (launch date + 30 days: the old store app keeps working until then, `backend/docs/auth.md`), and apply in Terrakube. Start **exactly one task**: the migrations run on boot (`RUN_MIGRATIONS` is not set, so it defaults to true) and several tasks booting together would each run them. The service has no health-check grace period, so if the rehearsal showed the migrations near the health-check limit, run them instead as a one-off `migration:run:prod` task with `RUN_MIGRATIONS=false` on the service (`deploy-production.md`). When the task is healthy, scale to the normal task count. From outside the allow-list `GET /public/health` is 200 and everything else 503 `MAINTENANCE`. Rollback of this step: revert the terraform merge and apply again.
- **0:20 Finish old deletions (#687):** `finish-account-deletions` (dry run), check the count against the rehearsal, `--apply` per the recorded scope, dry run again → 0.
- **0:25 Import:** `migrate-identities --dry-run`, check the table against the rehearsal (social links must match the issue 00 count), real, again (0 created, 0 emails). Transition emails queued and held. Then the super admin: `auth:super-admin:prod -- maria.leustean@commitglobal.org` (the address chosen before the date; it needs a web identity, which the import has just created). Without one nobody can validate new NGOs.
- **0:45 Web:** merge vic `develop` into `main` (Amplify deploys the new web; outside the allow-list it shows the maintenance page). No store release and no OTA tonight (see store day).
- **1:15 Smoke test** from the allow-listed network on web and phones: the rehearsal list (issue 22), including the regression pages Volunteers, Access requests, Access codes, Contracts and Activity log (R34).
- **1:45 Go / no-go.** No-go: restore the snapshot, redeploy the previous backend image with the old env vars at its normal task count and the previous web build (revert `main`, or redeploy the previous Amplify build), drop the queued emails. Nobody has been emailed, and nothing changed in the stores or in the old app.
- **2:00 Maintenance off:** `MAINTENANCE_MODE=false` and redeploy; check from a non-allow-listed network; log in once on web (link) and app (code). NGO Hub switches its link, `announce --release-transition` (`announce --status` until the queue is empty): admins get their 30-day link; volunteers get the transition email, which says the new app reaches the stores in the following days and the current app keeps working. **No `announce --template back`** in this plan. Team channel post. Same morning: submit the 2.0 builds for review (iOS App Store Connect, Android production track as a draft for review).

## Commit Global accounts (Maria Leuștean, decided 26 Nov 2026)

One person sees VIC from every side through email aliases. A web identity is admin of one organization only, and the web and mobile realms are separate, so the same address can also be a volunteer.

| Account | Realm | Role | How it exists |
|---|---|---|---|
| `maria.leustean@commitglobal.org` | web | admin of Asociatia Code for Romania + **super admin** (validation, all organizations, all volunteers) | imported at 0:25; `auth:super-admin:prod` right after |
| `maria.leustean+urbanesc@commitglobal.org` | web | admin of Asociația Urbanesc | imported at 0:25 |
| `maria.leustean+mobifree@commitglobal.org` | web | admin of Disaster Responders Organisations | imported at 0:25 |
| `maria.leustean@commitglobal.org` | mobile | volunteer (sees the app as volunteers do) | first login in the 2.0 app with the email code; then an access request to Code for Romania, approved by her web account |
| `maria.leustean+ongtest@commitglobal.org` | web | first admin of a throwaway NGO (tests registration and validation) | `/register` after go; validated by her super admin account; deleted from Setări after the check |

- [ ] 2:00: log in once with each web account (link) and check the super admin menu on the first.
- [ ] Store day: the mobile account, the access request and its approval.
- Super admin pages only list other organizations and volunteers; their own pages (events, hours, contracts) are visible only to their admins. Being added as admin to another NGO needs that NGO's consent (Team page there).

## Store day (when both stores have approved 2.0.0, usually 1–3 days after go)

- [ ] Release 2.0.0 in both stores (manual release).
- [ ] Publish the Update now OTA to the old app: `eas update --branch production --message "Update now banner" --clear-cache` from the `ota/update-now` branch, with all nine `EXPO_PUBLIC_*` production values available (`--environment production` alone is **not** enough: only the API URL is readable outside EAS; use the method chosen at T-1, `mobile/UPDATE-NOW.md` on that branch). Undo if needed: `eas update:roll-back-to-embedded --branch production --runtime-version exposdk:51.0.0`.
- [ ] `announce --template app --dry-run`, then real: the volunteers' identities get "Aplicația VIC nouă e în magazine" and every device a push.
- [ ] Check a 2.0 install logs in with the email code on both platforms, and an old install shows the banner on its second launch.

## Comments
