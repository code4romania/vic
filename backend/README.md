# VIC backend

NestJS API for VIC (web app for NGO admins, mobile app for volunteers).

- Authentication: [`docs/auth.md`](docs/auth.md)
- Production deploy checklist: [`docs/deploy-production.md`](docs/deploy-production.md)

## Local setup

```bash
npm ci
cp .env.example .env      # fill in; docs/auth.md has the key generation commands
docker compose up -d      # Postgres, Redis, mailcatcher (S3: adobe/s3mock on :9090, see .env.example)
npm run start:dev
```

Pending migrations run when the API boots (`RUN_MIGRATIONS`, default `true`). Locally, missing `MAIL_FROM`,
`THROTTLE_TTL` (milliseconds), `THROTTLE_LIMIT`, `CACHE_TTL` get defaults; in `staging` and `production` the API
refuses to start without them (`src/infrastructure/config/environment-config.ts`).

## Tests

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint:check                                  # `npm run lint` also fixes
npx jest --maxWorkers=2                             # unit (some use the local Postgres)
npx jest --config ./test/jest-e2e.json --maxWorkers=2   # e2e: local Postgres, Redis and S3 emulator
```

CI (`.github/workflows/ci.yml`) runs the same commands against Postgres 16, Redis 7 and adobe/s3mock.

## Scripts

| Development (ts-node, `src/`) | Production image (`node`, `dist/`) |
|---|---|
| `npm run migration:run` | `npm run migration:run:prod` |
| `npm run migration:show` | `npm run migration:show:prod` |
| `npm run auth:migrate -- [--dry-run]` | `npm run auth:migrate:prod -- [--dry-run]` |
| `npm run auth:super-admin -- <email>` | `npm run auth:super-admin:prod -- <email>` |
| `npm run org:suspend -- <id>` / `org:unsuspend` | `npm run org:suspend:prod -- <id>` / `org:unsuspend:prod` |
| `npm run announce -- ...` | `npm run announce:prod -- ...` |

The production image contains only `dist/` and the production dependencies (no `src/`, no ts-node), so on a
deployed environment use the `:prod` scripts, e.g. as a one-off ECS task with the command overridden.

## Running in production

- The image (`Dockerfile`) runs `node dist/main` as the `node` user.
- Health check: `GET /public/health` — 200 when Postgres and Redis answer, 503 otherwise.
- `SIGTERM` closes the app gracefully (HTTP server, Bull queues, Redis and database connections).
- Set `RUN_MIGRATIONS=false` on the service and run `npm run migration:run:prod` once per deploy, so that
  several tasks booting together do not each run the migrations.
