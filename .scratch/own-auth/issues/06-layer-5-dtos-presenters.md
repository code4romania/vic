# Layer 5 · DTOs and presenters (the API contract)

Status: done (built and tested locally, 2026-11-03)
Type: task
Blocked by: 05
Tracker card: B3 (part), B4 (part)

Pure contract: request validation and response shapes. The contract is fixed only when routes exist: /auth and /mobile/auth at Layer 7 (issue 08), organization, Team and super admin at Layer 8 (issue 09) (decisions R25).

## Checklist

- [x] `src/api/auth/dto/validators.ts`: `IsNormalizedEmail()` (trim + lowercase `@Transform`, `@IsEmail`), `IsStrongPassword()` (`@Matches(PASSWORD_REGEX)`), `IsSixDigitCode()` (`/^\d{6}$/`), `IsLinkToken()` (`/^[A-Za-z0-9_-]{43}$/`).
- [x] Web `src/api/auth/dto/`: `LoginDto { email, password }`, `ForgotPasswordDto { email }`, `ChangePasswordDto { currentPassword, newPassword }`, `SetPasswordDto { token, password }`, `ConfirmEmailDto { token }`. Shared by both realms: `ResendVerificationDto { email }` in `src/api/auth/dto/` (decisions R15; used by `POST /auth/web/resend-verification` and `POST /mobile/auth/resend-verification`).
- [x] Mobile `src/api/_mobile/auth/dto/`: `RegisterDto { email, password, phone }` (phone rule as `CreateRegularUserDto`), `RefreshDto { refreshToken }`, `LogoutDto { refreshToken }`, `ResetPasswordWithCodeDto { email, code, password }`, `SocialLoginDto { provider, token }`.
- [ ] Organization `src/api/organization/dto/`: `RegisterOrganizationDto` (name, email, phone, address as free text with no county or city (decisions R6), activityArea, description, website?, taxId, firstName, lastName, adminEmail, adminPhone, password, acceptedTerms, turnstileToken; files arrive through the interceptor), `UpdateOrganizationDto` (every field optional; replaces `UpdateOrganizationDescriptionDto`), `AddAdminDto { firstName, lastName, email, phone }`.
- [ ] Presenters (auth ones done; Team, pending and organization ones in Layer 8): `SessionPresenter { accessToken, expiresIn, refreshToken?, user? }`, `AdminUserPresenter` extended to `{ id, name, email, phone, organizationId, superAdmin }` (today `{ id, name }`; keep the field names the web header reads), `TokenInfoPresenter { type, purpose, realm, maskedEmail, organizationName? }` with `purpose: 'transition' | 'invite' | 'reset' | 'verify_email'`, where transition means `type = invite AND sent_by IS NULL` (decisions R16), `MobileRealmResultPresenter { realm: 'mobile', email }` (the mobile-realm answer of set-password and confirm-email, decisions R17), `RegisterResultPresenter { maskedEmail, phone? }`, `TeamMemberPresenter { id, name, email, phone, status, inviteExpiresAt, lastInviteSentAt, lastInviteSentBy, lastLoginAt }`, `PendingOrganizationPresenter`, `OrganizationPresenter` + `status`, `validatedAt`, `taxId`, `website`, `statuteUrl` (presigned). Every presenter that emits `logo` goes through the Layer 8 transformer helper (decisions R27).
- [x] Specs with `plainToInstance` + `validate`: email normalised, weak password refused, code and token regexes, multipart DTO under `enableImplicitConversion`.

## Done when

Build, lint, test pass. The Swagger check moved to Layers 7 and 8 (decisions R26), because no route uses these DTOs yet.

## Comments
- 2026-10-30: Layer 5 built locally (uncommitted), auth part only. Validators (`IsNormalizedEmail`, `IsStrongPassword`, `IsPasswordInput`, `IsSixDigitCode`, `IsLinkToken`), the web, shared and mobile DTOs, and the presenters `SessionPresenter`, `TokenInfoPresenter` (+ `TokenPurpose`), `MobileRealmResultPresenter`, `RegisterResultPresenter`, `AdminProfilePresenter`. Spec `src/api/auth/dto/auth.dto.spec.ts`.
  - **`AdminUserPresenter` is not grown.** The activity log uses it for other admins (created / approved / rejected by), so adding `email` and `phone` would show every admin's contact details there. The logged-in admin gets the new `AdminProfilePresenter { id, name, email, phone, organizationId, superAdmin }` instead (login, set-password, confirm-email, `GET /auth/web/me`).
  - Login and change-password's current password use `IsPasswordInput` (string, max 256): no rule, so an old weak password just fails AUTH_001, and argon2 never hashes megabytes.
  - **Not done here, moved to Layer 8 where they are used:** `RegisterOrganizationDto`, `UpdateOrganizationDto`, `AddAdminDto`, `TeamMemberPresenter`, `PendingOrganizationPresenter`, the `OrganizationPresenter` fields and the R27 logo helper.
