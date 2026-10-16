# Layer 9 · Commands, held transition emails, cleanup job, Cognito and NGO Hub removal

Status: ready-for-agent
Type: task
Blocked by: 09
Tracker card: B5 (part), B6

## Checklist

- [ ] `src/modules/mail/templates/mail-template.hbs`: optional `{{#if code}}` block (code large and centered). `partials/faq-tc.hbs` and the footer use `contactEmail` only; no onghub.com mention left.
- [ ] Held transition emails: Bull queue `auth-transition-vic` (add to `QUEUES`), created paused, `limiter: { max: 10, duration: 1000 }`; a processor that calls `MailService.sendEmail`. `auth:migrate` enqueues one job per identity (the email is composed when the link is issued, since the secret exists only then); `announce --release-transition` resumes the queue.
- [ ] `src/commands/` (ts-node with `tsconfig-paths`, `NestFactory.createApplicationContext(AppModule)`), one npm script each:
  - `migrate-identities.command.ts` → `auth:migrate [--dry-run]`: every `user` with `deleted_on IS NULL`, batches of 500 in one transaction each; admins → web identity (`lower(trim(email))`, `legacyCognitoUsername = cognito_id`, `userId`, pending_password), regulars → mobile identity with `emailVerifiedAt = created_on`; nobody disabled; upsert on (realm, email); one 30-day invite link and one held transition email per identity (admin or volunteer template); counts printed (admins, volunteers, skipped, duplicates kept newest and listed, emails queued); dry run rolls back.
  - `organization-status.command.ts` → `org:suspend -- <id> [--reason]`, `org:unsuspend -- <id>` (Layer 8 use cases).
  - `super-admin.command.ts` → `auth:super-admin -- <email> [--remove]`; prints the current super admins.
  - `announce.command.ts` → `announce -- --template <announce|reminder|back> [--dry-run]` (email every identity deduplicated across realms at 10/s; push to every `push_tokens` row through `PushNotificationsFacade`) and `announce -- --release-transition`.
- [ ] `src/modules/auth/jobs/auth-cleanup.processor.ts` on queue `auth-maintenance-vic`, repeatable `30 3 * * *`: refresh tokens expired or revoked > 7 days; auth tokens ended > 90 days; pending organizations > 7 days with their admin user, identity and S3 files; unconfirmed mobile identities > 7 days. Logs counts.
- [ ] Remove `src/infrastructure/providers/cognito/`, `src/infrastructure/config/cognito.config.ts`, `src/modules/onghub/`, `@aws-sdk/client-cognito-identity-provider`; `COGNITO_*` and `ONG_HUB_API` from `environment-config.ts` and `.env.example`. Keep `jwks-rsa` (Apple verifier). `grep -ri cognito src` matches only `legacy_cognito_username`, `cognitoId` in the user entity / models, and old migrations.
- [ ] Finish `backend/docs/auth.md` (tables, token life, endpoints, commands, tests), `docs/adr/0001-own-authentication.md`, `CONTEXT.md` glossary.
- [ ] Specs: `migrate-identities.command.spec` on the test DB (admin, volunteer, both, deleted, duplicate; all pending_password; held emails counted; second run changes nothing), `auth-cleanup.processor.spec` (one row to go and one to stay per kind), `announce` dry run renders the first email.

## Done when

Build passes with the Cognito packages gone; lint, test pass; `npm run auth:migrate -- --dry-run` prints counts against the local seed.

## Comments
