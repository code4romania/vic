# C2 · Cutover: T-7 announcement, T-1 checks, the window, "VIC is back"

Status: ready-for-human
Type: task
Blocked by: 22, 21, 18
Tracker card: C2

Two people (backend + database; web, stores, OTA + communication) plus one on the checklist calling go / no-go. The smoke-test team works from the allow-listed network (`MAINTENANCE_ALLOWED_IPS`, R2). Rollback is complete until go / no-go; after maintenance is lifted problems are fixed forward. Where this file and the Guide differ, `../decisions.md` wins.

- [ ] Before T-7: the announce PR is deployed to production (issue 20, R3). Its image tag is the rollback image.
- [ ] T-7: `npm run announce -- --template announce` (dry run first); it reads recipients from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`) and sends through the existing mail queue. Login notices live; store build submitted and held.
- [ ] T-1: `npm run announce -- --template reminder`; pre-flight SQL zero rows; production secrets applied (including `MAINTENANCE_ALLOWED_IPS`); `MOBILE_MIN_VERSION=1.0.19`; previous image tag, web build and the VIC service's normal task count noted; NGO Hub ready; OTA command ready.
- [ ] Window:
  - **0:00 Maintenance on (R1).** Switch the web to its static maintenance page. Scale the VIC ECS service to 0 tasks; the shared ALB answers 503 for the VIC host. Scale only the VIC service, never the ALB (NGO Hub shares it). Take the database snapshot and write down its id; nothing proceeds without it.
  - **0:15 Deploy the new backend** with `MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS` and `MOBILE_MIN_VERSION=1.1.0`, back to its normal task count; the migration runs on boot. From outside the allow-list `GET /public/health` is 200 and everything else 503 `MAINTENANCE`.
  - **0:25** `auth:migrate --dry-run`, real, again (0 changes). Transition emails queued and held.
  - **0:45** Deploy web (outside the allow-list it shows the maintenance message), release store versions, publish the Update now OTA.
  - **1:15 Smoke test** from the allow-listed network on web and phones: the rehearsal list, including the regression pages Volunteers, Access requests, Access codes, Contracts and Activity log (R34).
  - **1:45 Go / no-go.** No-go: restore the snapshot, redeploy the previous backend image with the old env vars at its normal task count and the previous web build, drop the queued emails. Nobody has been emailed.
  - **2:00 Maintenance off:** `MAINTENANCE_MODE=false` and redeploy; check from a non-allow-listed network; log in once on web and app. NGO Hub switches its link, `announce -- --release-transition`, `--template back`, team channel post.

## Comments
