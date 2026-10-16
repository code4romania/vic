# Layer 1 · Database: enums, four entities, user and organization changes, migration

Status: ready-for-agent
Type: task
Blocked by: 01
Tracker card: B1

Deployable on its own: the API still runs on Cognito and nothing reads the new tables.

## Checklist

- [ ] `src/modules/auth/enums/auth.enums.ts`: `AuthRealm` (web, mobile), `AuthIdentityStatus` (pending_password, active, disabled), `AuthTokenType` (verify_email, reset_password, invite), `AuthTokenForm` (link, code), `AuthProvider` (google, facebook, apple). `src/modules/organization/enums/organization-status.enum.ts`: `OrganizationStatus` (pending, active, suspended).
- [ ] Entities in `src/modules/auth/entities/`, pattern `src/modules/user/entities/user.entity.ts` (extends `BaseEntity`, `@PrimaryGeneratedColumn('uuid')`, snake_case `name` on every column):
  - `auth-identity.entity.ts`: realm, email, password_hash (nullable), status (default pending_password), super_admin (boolean default false), email_verified_at, password_set_at, last_login_at, failed_attempts (default 0), locked_until, legacy_cognito_username, user_id → `UserEntity` (nullable, `ON DELETE SET NULL`).
  - `auth-token.entity.ts`: identity_id → auth_identity (`CASCADE`), type, form, token_hash (unique), expires_at, used_at, replaced_at, attempts (default 0), sent_to, sent_by → user (nullable).
  - `refresh-token.entity.ts`: identity_id (`CASCADE`, indexed), token_hash (unique), previous_hash (indexed, nullable), rotated_at, expires_at, revoked_at, last_used_at, user_agent, ip.
  - `auth-identity-provider.entity.ts`: identity_id (`CASCADE`), provider, subject, email_at_link; unique (provider, subject).
- [ ] `user.entity.ts`: `cognitoId` `nullable: true`; remove `@Unique(USER_CONSTRAINTS.COGNITO_USER_TYPE_EMAIL_UNIQUE, …)` and the `USER_CONSTRAINTS` constant.
- [ ] `organization.entity.ts`: `status` (varchar, default active), `validatedAt`, `validatedBy` (`ManyToOne UserEntity`, nullable), `taxId` (nullable), `website`, `statuteUrl`, `suspendedAt`.
- [ ] Models + transformers `src/modules/auth/models/{auth-identity,auth-token,refresh-token,auth-identity-provider}.model.ts` (pattern `admin-user.model.ts`: `I…Model`, `Create…Options`, `Find…Options`, `…Transformer.fromEntity/toEntity`; `toEntity` lowercases and trims the email). Extend `IOrganizationModel` and `OrganizationTransformer` in `organization.model.ts`.
- [ ] `src/modules/auth/auth.module.ts`: `TypeOrmModule.forFeature([AuthIdentityEntity, AuthTokenEntity, RefreshTokenEntity, AuthIdentityProviderEntity])`.
- [ ] Migration `OwnAuthTables`: `npm run build && npm run migration:generate --name=OwnAuthTables`, then complete `up()` by hand, in this order: the four tables; unique `token_hash`; partial unique `auth_identity (realm, email) WHERE deleted_on IS NULL`; partial `auth_token (identity_id, type) WHERE used_at IS NULL AND replaced_at IS NULL`; `refresh_token (identity_id)`, `refresh_token (previous_hash)`; unique `auth_identity_provider (provider, subject)`; `ALTER TABLE "user" ALTER COLUMN "cognito_id" DROP NOT NULL`; `DROP CONSTRAINT "cognito-userType-email-unique"`; `CREATE UNIQUE INDEX user_type_email_unique ON "user" ("type", lower("email")) WHERE "deleted_on" IS NULL`; organization columns; `UPDATE organization SET status = 'active', validated_at = now()`; partial unique on `tax_id`. `down()` reverses in the opposite order and restores the constraint from `1684135710464-UserEmailTypeUnique.ts`.
- [ ] `src/modules/auth/models/auth-identity.model.spec.ts`.

## Done when

`npm run migration:run`, `npm run migration:revert`, `npm run migration:run` succeed against `docker compose up db`; `npm run migration:show` lists it; build, lint, test pass; pre-flight queries from issue 01 return zero rows on the production copy or every row has a recorded fix.

## Comments
