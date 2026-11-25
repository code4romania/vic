# D2 · Day 30 cleanup: drop cognito_id, remove migration notices, delete Cognito pools, update docs

Status: needs-info
Type: task
Blocked by: 24
Tracker card: D2

> **Updated 2026-11-25:** links and codes instead of passwords (#514), the notice switches that exist today, the transition queue, and what the language work (#732) adds. Needs info: the `MOBILE_MIN_VERSION` to keep, and whether anyone still needs `legacy_cognito_username`.

One PR per repository plus the infrastructure steps. Day 30 is also when the transition links expire (30 days), so the admins who never used theirs now ask for a link on the login page.

## Backend (vic)

- [ ] Migration dropping `user.cognito_id`; remove `cognitoId` from the entity, models and transformers. `grep -ri cognito backend/src` then matches only old migrations (and `legacy_cognito_username`, if kept).
- [ ] Remove the codes no longer returned (AUTH_001, AUTH_002, AUTH_007) from the backend and from the web and mobile error maps, or keep them documented as retired. Never reuse their numbers.
- [ ] `announce --release-transition` has emptied the transition queue (`announce --status`); remove the paused queue's leftovers in `/admin/queues` if any.
- [ ] `backend/README.md`: own login with links and codes, env vars and key generation (`backend/docs/auth.md`), Google / Apple credentials, the commands (`auth:migrate`, `users:finish-deletions`, `auth:super-admin`, `org:suspend`, `announce`), the maintenance switch, how to run the unit and e2e tests.

- [ ] End of the old store app's transition (decided 25 Nov 2026): remove `LegacyCognitoMobileStrategy`, the
      `LEGACY_*` settings and every route or field marked LEGACY (`/mobile/contract/pending|:id/sign|:id/cancel`,
      `/mobile/user/personal-data`, the event's `tasks`); terraform: drop `vic_legacy_mobile_until` and the two
      `LEGACY_*` variables. Do this before the Cognito pool is deleted below.

## Web and mobile (vic)

- [ ] Remove the migration notices: web `VITE_MIGRATION_NOTICE_UNTIL` (terraform `vic_migration_notice_until`) and mobile `EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL` (`mobile/eas.json`), with their components and translation keys in both languages (ro, en).
- [ ] The mobile app ships as a normal store release, OTA-safe on its runtime (`mobile/app.config.ts`); delete the `ota/update-now` branch.
- [ ] Decide the `MOBILE_MIN_VERSION` to keep (2.0.0, or higher if a later store release is required).
- [ ] READMEs: env vars, Google / Apple credentials, tests, runtime-version policy, the two languages.

## Infrastructure (terraform-ngohub)

- [ ] Delete VIC's Cognito user pool (mobile) and its app clients; remove the Cognito IAM permissions from the VIC backend role; remove the `vic_cognito` resources and any Cognito value still passed to VIC.
- [ ] NGO Hub removes VIC's app client from its Cognito pool and VIC from its application list (the link already points at `https://vic.ngohub.ro`).
- [ ] Delete the staging copy of production, the rollback image and the previous web build.
- [ ] Set `vic_mobile_min_version` to the version decided above; `vic_maintenance_mode` stays `false`.

## Documentation

- [ ] Privacy policy and terms (issue 21): VIC holds the accounts, no passwords, Google / Apple sign-in, NGO Hub no longer involved in login.

## Comments
