# Layer 5 · DTOs and presenters (the API contract)

Status: ready-for-agent
Type: task
Blocked by: 05
Tracker card: B3 (part), B4 (part)

Pure contract: request validation and response shapes. Web and mobile issues get their detail once this layer is merged.

## Checklist

- [ ] `src/api/auth/dto/validators.ts`: `IsNormalizedEmail()` (trim + lowercase `@Transform`, `@IsEmail`), `IsStrongPassword()` (`@Matches(PASSWORD_REGEX)`), `IsSixDigitCode()` (`/^\d{6}$/`), `IsLinkToken()` (`/^[A-Za-z0-9_-]{43}$/`).
- [ ] Web `src/api/auth/dto/`: `LoginDto { email, password }`, `ForgotPasswordDto { email }`, `ChangePasswordDto { currentPassword, newPassword }`, `SetPasswordDto { token, password }`, `ConfirmEmailDto { token }`.
- [ ] Mobile `src/api/_mobile/auth/dto/`: `RegisterDto { email, password, phone }` (phone rule as `CreateRegularUserDto`), `ResendVerificationDto { email }`, `RefreshDto { refreshToken }`, `LogoutDto { refreshToken }`, `ResetPasswordWithCodeDto { email, code, password }`, `SocialLoginDto { provider, token }`.
- [ ] Organization `src/api/organization/dto/`: `RegisterOrganizationDto` (name, email, phone, address, countyId, cityId, activityArea, description, website?, taxId, firstName, lastName, adminEmail, adminPhone, password, acceptedTerms, turnstileToken; files arrive through the interceptor), `UpdateOrganizationDto` (every field optional; replaces `UpdateOrganizationDescriptionDto`), `AddAdminDto { firstName, lastName, email, phone }`.
- [ ] Presenters: `SessionPresenter { accessToken, expiresIn, refreshToken?, user? }`, `AdminUserPresenter` extended to `{ id, name, email, phone, organizationId, superAdmin }` (today `{ id, name }`; keep the field names the web header reads), `TokenInfoPresenter { type, realm, maskedEmail, organizationName? }`, `RegisterResultPresenter { maskedEmail, phone? }`, `TeamMemberPresenter { id, name, email, phone, status, inviteExpiresAt, lastInviteSentAt, lastInviteSentBy, lastLoginAt }`, `PendingOrganizationPresenter`, `OrganizationPresenter` + `status`, `validatedAt`, `taxId`, `website`, `statuteUrl` (presigned).
- [ ] Specs with `plainToInstance` + `validate`: email normalised, weak password refused, code and token regexes, multipart DTO under `enableImplicitConversion`.

## Done when

Build, lint, test pass; Swagger (`NODE_ENV=local`) shows every DTO.

## Comments
