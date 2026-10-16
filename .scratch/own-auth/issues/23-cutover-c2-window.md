# C2 · Cutover: T-7 announcement, T-1 checks, the window, "VIC is back"

Status: ready-for-human
Type: task
Blocked by: 22, 21, 18
Tracker card: C2

Two people (backend + database; web, stores, OTA + communication) plus one on the checklist calling go / no-go. Rollback is complete until go / no-go; after maintenance is lifted problems are fixed forward.

- [ ] T-7: `npm run announce -- --template announce` (dry run first); login notices live; store build submitted and held.
- [ ] T-1: `announce -- --template reminder`; pre-flight SQL zero rows; production secrets applied; `MOBILE_MIN_VERSION=1.0.19`; previous image tag and web build noted; NGO Hub ready; OTA command ready.
- [ ] Window: 0:00 maintenance on + snapshot id · 0:15 deploy backend (`MOBILE_MIN_VERSION=1.1.0`, migration on boot) · 0:25 `auth:migrate --dry-run`, real, again (0 changes) · 0:45 deploy web, release store versions, publish the Update now OTA · 1:15 smoke test · 1:45 go / no-go · 2:00 maintenance off, NGO Hub switches its link, `announce -- --release-transition`, `--template back`, team channel post.

## Comments
