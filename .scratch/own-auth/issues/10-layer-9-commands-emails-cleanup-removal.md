# Layer 9 · Commands, held transition emails, cleanup job, Cognito and NGO Hub removal

Status: done (built and tested locally, 2026-11-04)
Type: task
Blocked by: 09
Tracker card: B5 (part), B6

The T-7 announce and T-1 reminder are not in this layer (decisions R3): a small PR to `main` with no migration and no auth change adds the `announce` command, reading recipients from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`) and sending through the existing mail queue. It is deployed before T-7. This layer keeps only `--release-transition` and the `back` template, which read identities.

## Checklist

- [x] `src/modules/mail/templates/mail-template.hbs`: optional `{{#if code}}` block (code large and centered). Nothing else: the footer and `MailService` already supply `contactEmail`, and `faq-tc` is not rendered (decisions R31).
- [x] Held transition emails: Bull queue `auth-transition-vic` (add to `QUEUES`), created paused, `limiter: { max: 10, duration: 1000 }`; a processor that calls `MailService.sendEmail`. `auth:migrate` enqueues one job per identity (the email is composed when the link is issued, since the secret exists only then); `announce --release-transition` resumes the queue.
- [x] `src/commands/` (ts-node with `tsconfig-paths`, `NestFactory.createApplicationContext(AppModule)`), one npm script each:
  - `migrate-identities.command.ts` → `auth:migrate [--dry-run]`: every `user` with `deleted_on IS NULL`, batches of 500 in one transaction each; admins → web identity (`lower(trim(email))`, `legacyCognitoUsername = cognito_id`, `userId`, pending_password), regulars → mobile identity with `emailVerifiedAt = created_on`, and when `cognito_id` starts with `google_`, `facebook_` or `signinwithapple_` an `auth_identity_provider` link (provider google / facebook / apple, subject = the rest of the Cognito username; decisions R35, sized by the issue 01 pre-flight); nobody disabled; upsert on (realm, email); one 30-day invite link and one held transition email per identity (admin or volunteer template); counts printed (admins, volunteers, skipped, duplicates kept newest and listed, emails queued); dry run rolls back.
  - `organization-status.command.ts` → `org:suspend -- <id> [--reason]`, `org:unsuspend -- <id>` (Layer 8 use cases).
  - `super-admin.command.ts` → `auth:super-admin -- <email> [--remove]`; prints the current super admins.
  - Extend the `announce` command from the R3 PR (merge `main` into `feat/own-auth` first if it is not there yet): `--template back [--dry-run]` (email every identity deduplicated across realms at 10/s; push to every `push_tokens` row through `PushNotificationsFacade`) and `--release-transition`.
- [x] `src/modules/auth/jobs/auth-cleanup.processor.ts` on queue `auth-maintenance-vic`, repeatable `30 3 * * *`: refresh tokens expired or revoked > 7 days (`deleteExpiredOrRevokedBefore`); auth tokens ended > 90 days (`deleteEndedBefore`); pending organizations > 7 days with their admin user, identity and S3 files; unconfirmed mobile identities > 7 days (`deleteUnverifiedMobileBefore`). Repository methods from Layer 2 (decisions R10). Logs counts.
- [x] Remove `src/infrastructure/providers/cognito/`, `src/infrastructure/config/cognito.config.ts`, `src/modules/onghub/`, `@aws-sdk/client-cognito-identity-provider`; `COGNITO_*` and `ONG_HUB_API` from `environment-config.ts` and `.env.example`. Keep `jwks-rsa` (Apple verifier). `grep -ri cognito src` matches only `legacy_cognito_username`, `cognitoId` in the user entity / models, and old migrations.
- [x] Finish `backend/docs/auth.md` (tables, token life, endpoints, commands, tests), `docs/adr/0001-own-authentication.md`, `CONTEXT.md` glossary.
- [x] Specs: `migrate-identities.command.spec` on the test DB (admin, volunteer, both, deleted, duplicate, a `google_…` volunteer gets its provider link; all pending_password; held emails counted; second run changes nothing), `auth-cleanup.processor.spec` (one row to go and one to stay per kind), `announce --template back --dry-run` renders the first email.

## Done when

Build passes with the Cognito packages gone; lint, test pass; `npm run auth:migrate -- --dry-run` prints counts against the local seed.

## Comments
- 2026-10-30: the `{{#if code}}` block in `mail-template.hbs` is already done (Layer 3), together with an optional `{{#if english}}` block for the English text. Nothing left to change in the template here.
- 2026-11-04: built locally, no PR (the user wants a local proof first). Deviations:
  - The R3 announce command was never put on `main`; `announce --template announce|reminder --date "<date>"` lives on this branch next to `back`, `--release-transition` and a new `--status`. When the cutover is real, split announce/reminder into the small PR to `main` again.
  - Refresh tokens are deleted when expired **or** revoked more than 7 days ago (the issue wording); the Guide said `expires_at < now()`.
  - Cleanup of pending NGOs is raw SQL in the processor (organization, its admin users, their identities) plus S3 deletes after the commit; added `S3Service.deletePublicFile(url)` and a bucket parameter to `deleteFile`.
  - Migration sets `legacy_cognito_username` for volunteers too, not only admins.
  - `grep -ri cognito src` also matches comments and the migration use case that parses Cognito usernames; nothing imports Cognito.
- 2026-11-04 local run (backup of the DB before: scratchpad `vic-before-layer9.dump`): `auth:migrate --dry-run` then for real: 15 users read, 2 admins + 6 volunteers created, 3 provider links, 7 unchanged (seeded identities), 1 deleted skipped, 8 emails held (queue paused, mailcatcher 0). Second run: 0 created, 0 emails. `announce --release-transition` + API running: 8 emails in mailcatcher. Admin transition link: `GET /auth/token/:secret` → purpose transition; set-password → session; login 200. `auth:super-admin` set/remove/list OK; `org:suspend` → login 403 AUTH_004; `org:unsuspend` → 200. `announce --template back --dry-run`: 15 recipients; `--template announce --dry-run`: 14.
- 2026-11-04 checks: `npm run build` (Cognito package removed), `npm run lint` clean, `npm run test` 22 suites / 227 tests, `npm run test:e2e` 7 suites / 46 tests.

- 2026-11-06, email review in mailcatcher (local): every auth template is ro + en in one message, no unrendered placeholders, links to the local web app. Changed: the "ONG nou de validat" email linked only to a presigned statute URL (X-Amz-Expires 86400, dead after a day) and told super admins to use the validation page without linking it; its button now opens `${WEB_APP_URL}/admin/validation` (the statute is there) and confirm-email no longer presigns for it. "Organizație validată" now has an "Intră în VIC" button to `/login`. `AuthMailerService.validationPageUrl()` / `loginUrl()`. `auth-emails.spec.ts` now also renders announce, reminder and back (bulk messages to everyone) under strict mode; e2e checks both buttons and downloads the statute from the validation API. Not auth: the access-request approval email is Romanian only (existing template).
