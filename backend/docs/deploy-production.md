# Deploying VIC 2.0 to production

The first VIC 2.0 deploy changes the schema destructively and moves every account to the own authentication
(`docs/auth.md`). **Rehearse every step below on staging, on a copy of the production data, before the real
run**, and keep the timings and outputs of the rehearsal.

The infrastructure (ECS service, ALB, RDS, ElastiCache) lives in
[terraform-ngohub](https://github.com/code4romania/terraform-ngohub). The image is built by
`.github/workflows/build-image.yml`; CI (`.github/workflows/ci.yml`) must be green on the commit being deployed.

## 1. Backups (before anything else)

- [ ] Manual RDS snapshot, named after the release (e.g. `vic-pre-2-0`).
- [ ] `pg_dump --format=custom` of the database, stored outside the RDS account (the snapshot is not enough if
      the instance or account is lost).
- [ ] S3 inventory (or `aws s3 ls --recursive` listing) of the private and public buckets.

Migrations that **delete data for good** (their `down()` only restores the structure):

| Migration | What is lost |
|---|---|
| `RemoveIdCardData` | the `user_personal_data` table (ID card data) |
| `SimplifyEvents` | event posters, internal notes, attendance type / mention settings, event tasks |
| `AnnouncementTypeAndDisplayPeriod` | department targeting of announcements (they become organization-wide) |
| `ContractStatuses` | the old contract statuses (approved / pending / rejected → active / inactive) |
| `OrganizationSelfDeclaration` | the organizations' statute links (`statute_url`) |
| `MagicLinkLogin` | password hashes, lockout data, password reset tokens |

## 2. Pre-migration checks and archives (on the production data)

- [ ] Archive the department-targeted announcements (they will reach the whole organization afterwards):
      ```sql
      \copy (SELECT a.*, t."organizationStructureId" FROM announcement a
             JOIN announcement_targets_organization_structure t ON t."announcementId" = a.id)
        TO 'announcements-targeted.csv' CSV HEADER
      ```
      Tell the affected organizations if any active announcement was targeted.
- [ ] Run `scripts/auth-preflight.sql` (duplicate emails per user type ignoring case, admins without an
      organization, malformed emails, colliding organizations). Every query returns zero rows, or each row has a
      recorded manual fix. `OwnAuthTables` fails on duplicate emails.

## 3. Configuration

The API refuses to start in `staging`/`production` when one of these is missing or empty
(`src/infrastructure/config/environment-config.ts`). Set them in the task definition / secrets manager:

- [ ] `NODE_ENV=production`
- [ ] `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_KEY_ID`, `AUTH_TOKEN_KEY` — new, per environment (`docs/auth.md`)
- [ ] `WEB_APP_URL` (production web app), `CORS_ORIGINS` (the same origin, comma separated if more)
- [ ] `TURNSTILE_SECRET` (production site key on the web app)
- [ ] `GOOGLE_CLIENT_IDS` (web, iOS and Android client ids)
- [ ] `APPLE_BUNDLE_ID`, `APPLE_SERVICES_ID` — the Services ID's domain and return URL include the production domain
- [ ] `MAIL_FROM` — an address on a domain **verified in SES** (production access, not sandbox); `MAIL_CONTACT`
- [ ] `THROTTLE_TTL` (**milliseconds**, at least 1000, e.g. `60000`), `THROTTLE_LIMIT` (e.g. `100`)
- [ ] `CACHE_TTL`, `AWS_S3_BUCKET_NAME`, `AWS_S3_BUCKET_NAME_PUBLIC` (`<bucket>.s3.<region>.amazonaws.com`)
- [ ] `MOBILE_MIN_VERSION` — the first VIC 2.0 app version; older apps get 426 and an update screen
- [ ] `RUN_MIGRATIONS=false` on the service (see 5); `MAINTENANCE_MODE`, `MAINTENANCE_ALLOWED_IPS` (see 4)
- [ ] Leave `AWS_S3_ENDPOINT`, `AWS_S3_PUBLIC_BUCKET`, `AWS_S3_PUBLIC_BASE_URL`, `REDIS_KEY_PREFIX` unset
- [ ] Remove `COGNITO_*` and `ONG_HUB_API`

Infrastructure:

- [ ] Redis (ElastiCache) `maxmemory-policy noeviction`: the Bull queues (mail, held transition emails) live in
      Redis and an evicted key loses jobs.
- [ ] `/admin/queues` (Bull Board) is blocked in the API **and** by an ALB listener rule (deny `/admin/*`).
- [ ] ALB health check path stays `GET /public/health`. It now answers 200 only when Postgres and Redis respond
      (503 otherwise) and is open during maintenance mode.

## 4. Deploy in maintenance mode, one task

- [ ] Set `MAINTENANCE_MODE=true`, `MAINTENANCE_ALLOWED_IPS=<smoke-test team IPs>`, scale the service to
      **one** task (desired count 1) and deploy the new image.

## 5. Migrations

Migrations do not run at boot in production (`RUN_MIGRATIONS=false`): several ECS tasks starting together would
each try to apply them. Run them once, as a one-off ECS task from the **same image and task definition**, with
the command overridden:

```bash
npm run migration:show:prod   # what is pending
npm run migration:run:prod    # applies them (TypeORM CLI over dist/, one transaction per migration)
```

(Without that one-off task, leaving `RUN_MIGRATIONS` unset on a service with exactly one task also works: the
task migrates on boot. Never with more than one task.)

- [ ] `migration:run:prod` finished without error; `migration:show:prod` shows everything applied.

## 6. Identities and super admin (one-off tasks, same image)

The production image has no `src/` and no ts-node: use the `:prod` scripts, which run the compiled commands
from `dist/commands/`.

- [ ] `npm run auth:migrate:prod -- --dry-run` — read the counts table (duplicates, skipped rows).
- [ ] `npm run auth:migrate:prod` — the real run (idempotent; transition emails are held, not sent).
- [ ] `npm run auth:super-admin:prod -- <email>` — create the super admin (a web identity must exist).
- [ ] Release the held transition emails when go is confirmed: `npm run announce:prod -- --release-transition`
      (`--status` shows the queue).

Other one-off commands: `org:suspend:prod -- <id> [--reason "..."]`, `org:unsuspend:prod -- <id>`,
`announce:prod -- --template ...` (see `docs/auth.md`).

## 7. Smoke tests (from an allow-listed IP)

- [ ] Register an organization (CUI, Turnstile, confirmation email), validate it as super admin.
- [ ] Invite an admin; the invitation email arrives and the link logs in.
- [ ] Magic link login on the web; email code login on mobile.
- [ ] Google login and Apple login (web and mobile).
- [ ] An old mobile app (below `MOBILE_MIN_VERSION`) gets 426 and the update screen.
- [ ] Delete the test organization and its accounts.

## 8. Open

- [ ] `MAINTENANCE_MODE=false`, deploy, then scale the service back to its normal task count.
- [ ] Watch for the first hours: ALB 5xx, API error logs, the mail queue (failed jobs, SES bounces and
      rejections), health check flaps.

## Rollback

Before `MAINTENANCE_MODE=false`: restore the RDS snapshot, empty the held transition queue, redeploy the
previous image. After opening, data written by VIC 2.0 would be lost by a snapshot restore: prefer a fix forward.
