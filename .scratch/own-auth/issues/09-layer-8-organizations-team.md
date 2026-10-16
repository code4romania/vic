# Layer 8 · NGO registration, validation gates, super admin, Team

Status: ready-for-agent
Type: task
Blocked by: 08
Tracker card: B4

Everything NGO Hub did for organizations and admins, plus the validation a VIC super admin performs after sign-up (design doc decisions 1, 2, 4).

## Checklist

- [ ] Organization module: repository `update(id, partial)` (today only description), `findMany` / `findWithEvents` / search add `status = 'active' AND validated_at IS NOT NULL`, `findPendingValidation()`, case-insensitive uniqueness lookup on name, email, phone, taxId; facade methods. `S3_FILE_PATHS.ORGANIZATIONS = 'organizations'`.
- [ ] `src/infrastructure/providers/turnstile/turnstile.service.ts`: `verify(token, ip)` against `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- [ ] `src/usecases/organization/register-organization.usecase.ts`: Turnstile → uniqueness (409) → statute PDF required (400) → one transaction: organization `pending`, `AdminUserEntity`, web identity (hash set, email unverified, `userId`); logo and statute to S3 `organizations/<orgId>`; 24 h `confirmOrganizationLink`. Per-IP throttle 5/min.
- [ ] Extend `confirm-email.usecase.ts`: identity in realm web with a pending organization → `emailVerifiedAt`, organization `active`, consume, `organizationRegistered` to the super admins (statute link included), session + cookie. A link used on an already-active NGO just logs in.
- [ ] `update-organization.usecase.ts` (all fields, optional logo and statute files, uniqueness on update), `list-pending-validation.usecase.ts`, `validate-organization.usecase.ts` (`validatedAt`, `validatedBy`; `organizationValidated` email to its admins), `suspend-organization.usecase.ts` / `unsuspend-organization.usecase.ts` (status, `suspendedAt`, admin identities disabled or restored to active / pending_password, sessions revoked; reused by the command in Layer 9).
- [ ] `src/usecases/team/`: `list-team` (admins joined with identity; status from identity + live invite `expiresAt`), `add-admin` (email free in realm web or 009; `AdminUserEntity` + identity pending_password → `send-invite`), `send-invite` (same NGO or 403; pending_password only or 400; rate limit or 010; invite link 14 days with `sentBy`; returns masked email), `set-admin-status` (not yourself → 400; disable: `disabled`, `revokeAll`, replace live tokens; enable: active or pending_password; tracked through `ActionsArchiveFacade`).
- [ ] Gates: `join-organization-by-access-code.usecase.ts` refuses unvalidated or suspended NGOs; `create-event.usecase.ts`, `create-activity-log-by-admin`, `create-activity-log-by-regular-user`, `approve-activity-log` throw ORG_005 for an unvalidated NGO. `login.usecase.ts`: web identity whose NGO is suspended → AUTH_004.
- [ ] Controllers: `src/api/organization/organization-registration.controller.ts` (`POST /organizations/register`, public, `FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'statute', maxCount: 1 }])`), `src/api/admin/organizations.controller.ts` (`admin/organizations`, `WebJwtAuthGuard` + `SuperAdminGuard`: `GET pending-validation`, `PATCH :id/validate`, `PATCH :id/suspend`, `PATCH :id/unsuspend`), `src/api/organization/team.controller.ts` (`organization/team`: `GET`, `POST`, `POST :userId/invite`, `PATCH :userId/disable`, `PATCH :userId/enable`), `organization.controller.ts` `PATCH /organization` multipart with `UpdateOrganizationDto`. Register in `api.module.ts`.
- [ ] Specs: register (statute required, Turnstile refused, duplicates 409), confirm (NGO branch), validate (403 for a plain admin), gates (refused while unvalidated, allowed after), send-invite (403 / 400 / 010), set-admin-status (self → 400).

## Done when

Build, lint, test pass; a pending NGO is absent from `GET /mobile/organization` and its admin gets 403 ORG_005 on `POST /event`.

## Comments
