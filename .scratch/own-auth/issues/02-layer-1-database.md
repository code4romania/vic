# Layer 1 · Database: enums, four entities, user and organization changes, migration

Status: done (built and tested locally, 2026-11-03)
Type: task
Blocked by: 01
Tracker card: B1

Local only: the migration runs against the local `docker compose` database and is not deployed or merged to `main` before the staging rehearsal (decided 21 Oct 2026, see `../flows.md`). The API still runs on Cognito and nothing reads the new tables.

## Checklist

- [x] `src/modules/auth/enums/auth.enums.ts`: `AuthRealm` (web, mobile), `AuthIdentityStatus` (pending_password, active, disabled), `AuthTokenType` (verify_email, reset_password, invite), `AuthTokenForm` (link, code), `AuthProvider` (google, facebook, apple). `src/modules/organization/enums/organization-status.enum.ts`: `OrganizationStatus` (pending, active, suspended).
- [x] Entities in `src/modules/auth/entities/`, pattern `src/modules/user/entities/user.entity.ts` (extends `BaseEntity`, `@PrimaryGeneratedColumn('uuid')`, snake_case `name` on every column):
  - `auth-identity.entity.ts`: realm, email, password_hash (nullable), status (default pending_password), super_admin (boolean default false), email_verified_at, password_set_at, last_login_at, failed_attempts (default 0), locked_until, legacy_cognito_username, user_id → `UserEntity` (nullable, `ON DELETE SET NULL`).
  - `auth-token.entity.ts`: identity_id → auth_identity (`CASCADE`), type, form, token_hash (unique), expires_at, used_at, replaced_at, attempts (default 0), sent_to, sent_by → user (nullable).
  - `refresh-token.entity.ts`: identity_id (`CASCADE`, indexed), token_hash (unique), previous_hash (indexed, nullable), rotated_at, expires_at, revoked_at, last_used_at, user_agent, ip.
  - `auth-identity-provider.entity.ts`: identity_id (`CASCADE`), provider, subject, email_at_link; unique (provider, subject).
- [x] `user.entity.ts`: `cognitoId` `nullable: true`; remove `@Unique(USER_CONSTRAINTS.COGNITO_USER_TYPE_EMAIL_UNIQUE, …)` and the `USER_CONSTRAINTS` constant.
- [x] `organization.entity.ts`: `status` (varchar, default active), `validatedAt`, `validatedBy` (`ManyToOne UserEntity`, nullable), `taxId` (nullable), `website`, `statuteUrl`, `suspendedAt`.
- [x] Models + transformers `src/modules/auth/models/{auth-identity,auth-token,refresh-token,auth-identity-provider}.model.ts` (pattern `admin-user.model.ts`: `I…Model`, `Create…Options`, `Find…Options`, `…Transformer.fromEntity/toEntity`; `toEntity` lowercases and trims the email). Extend `IOrganizationModel` and `OrganizationTransformer` in `organization.model.ts`.
- [x] `src/modules/auth/auth.module.ts`: `TypeOrmModule.forFeature([AuthIdentityEntity, AuthTokenEntity, RefreshTokenEntity, AuthIdentityProviderEntity])`.
- [x] Migration `OwnAuthTables`: `npm run build && npm run migration:generate --name=OwnAuthTables`, then complete `up()` by hand, in this order: the four tables; unique `token_hash`; partial unique `auth_identity (realm, email) WHERE deleted_on IS NULL`; partial `auth_token (identity_id, type) WHERE used_at IS NULL AND replaced_at IS NULL`; `refresh_token (identity_id)`, `refresh_token (previous_hash)`; unique `auth_identity_provider (provider, subject)`; `ALTER TABLE "user" ALTER COLUMN "cognito_id" DROP NOT NULL`; `DROP CONSTRAINT "cognito-userType-email-unique"`; `CREATE UNIQUE INDEX user_type_email_unique ON "user" ("type", lower("email")) WHERE "deleted_on" IS NULL`; organization columns; `UPDATE organization SET status = 'active', validated_at = now()`; partial unique on `tax_id`. `down()` reverses in the opposite order and restores the constraint from `1684135710464-UserEmailTypeUnique.ts`.
- [x] Admin events (decisions R7): add `DISABLE_ADMIN` and `ENABLE_ADMIN` to `TrackedEventName` in `src/modules/actions-archive/enums/action-resource-types.enum.ts`, with `TrackedEventData` shapes like `CHANGE_VOLUNTEER_STATUS` (`adminId`, `adminName`). The same migration runs `ALTER TYPE "public"."actions_archive_event_name_enum" ADD VALUE 'DISABLE_ADMIN'` and `... ADD VALUE 'ENABLE_ADMIN'`; `down()` recreates the enum without them, as `1687957625046-ActionsArchiveContractTargets.ts` does. Layer 8 (issue 09) writes these events.
- [x] No county or city column on `organization` (decisions R6): NGO registration keeps the free-text `address`.
- [x] `src/modules/auth/models/auth-identity.model.spec.ts`.

## Done when

`npm run migration:run`, `npm run migration:revert`, `npm run migration:run` succeed against `docker compose up db`; `npm run migration:show` lists it; `actions_archive_event_name_enum` contains `DISABLE_ADMIN` and `ENABLE_ADMIN` after `run` and does not after `revert`; build, lint, test pass; pre-flight queries from issue 01 return zero rows on the production copy or every row has a recorded fix.

## Comments
- 2026-10-30: Layer 1 built locally (uncommitted), against the `vic-own-auth-db` container on localhost:5433 only. Migration `1793360611355-OwnAuthTables.ts`: generated, then edited by hand: removed an unrelated `contract.template_id` FK drift the generator picked up (the entity says NO ACTION, migration `SetContractTemplateReferenceNullOnDelete` set SET NULL; left as it is), switched the admin events to `ALTER TYPE ... ADD VALUE` (down() rebuilds the enum), added `user_type_email_unique` and the organization backfill. The partial indexes are declared on the entities with `@Index({ where })`, and `user_type_email_unique` with `synchronize: false`, so a later `migration:generate` does not try to drop them. `OrganizationVolunteerTransformer` now spreads `OrganizationTransformer.fromEntity` (it failed to compile with the new organization fields).
  Checked locally with `scripts/auth-local-seed.sql`: with the problem rows loaded the migration fails on `user_type_email_unique` and rolls back; on clean data run → revert → run succeeds; after run the four tables exist, the enum has `DISABLE_ADMIN` and `ENABLE_ADMIN`, `cognito_id` is nullable, the old constraint is gone and every NGO is active and validated; after revert all of it is undone; `migration:show` lists it; a throwaway `migration:generate` shows only the old `contract` drift. Build, lint and test pass (2 suites, 19 tests).
  Not done: the pre-flight on a production copy (needs access); down() cannot restore `cognito_id NOT NULL` once users without a Cognito id exist, and cannot drop the admin enum values once an event uses them (fine for local and rehearsal reverts). `ALTER TYPE ... ADD VALUE` inside the migration transaction needs Postgres 12+ on staging and production.
