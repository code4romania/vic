# Layer 6 · Auth use cases and social token verifiers

Status: done (built and tested locally, 2026-11-03)
Type: task
Blocked by: 06
Tracker card: B3 (part), B8

One class per flow in `src/usecases/auth/`, realm passed as an argument. All registered in `src/usecases/use-case.module.ts`. The login endpoint never sends email.

## Checklist

- [x] `login.usecase.ts` (realm, email, password, client), in this order: web realm with no web identity → look for a mobile identity first and answer 012 (decisions R19); unknown email or identity with no hash → verify against a fixed dummy hash, then AUTH_001; disabled → 004; web identity whose organization is `suspended` → 004 (decisions R8); `lockedUntil > now` → 002; wrong password → `registerFailedLogin`, 001; `emailVerifiedAt` null → 003; success → `registerSuccessfulLogin`, `createSession`, return tokens and (web) the admin user.
- [x] `set-password.usecase.ts` (token, password): `peekLink` → `meetsPolicy` or 007 → one transaction (`manager` passed to the facade, `consume` and `revokeAll`, decisions R9): hash, `status = active`, `passwordSetAt`, `emailVerifiedAt` if null, `consume` (ends the other set-password links), `revokeAll` → `passwordChanged` email. Web realm: `createSession`, cookie. Mobile realm: no session; answer `{ realm: 'mobile', email }` so the page can show "Open the app" with the email (decisions R17).
- [x] `reset-password-with-code.usecase.ts` (email, code, password): identity by (mobile, email) → `verifyCode` → same transaction.
- [x] `forgot-password.usecase.ts` (realm, email): identity found and not disabled → reset_password link (web) or code (mobile) → email. Never throws; swallows AUTH_010.
- [x] `register-mobile.usecase.ts` (email, password, phone): exists → 009; `meetsPolicy`; identity active with hash, email unverified → `verifyEmailLink` → return `{ maskedEmail, phone }`.
- [x] `confirm-email.usecase.ts` (token): verify_email link; mobile identity → `emailVerifiedAt`, consume, answer `{ realm: 'mobile', email }` (decisions R17), no session. (The NGO branch is added in Layer 8.)
- [x] `refresh-session.usecase.ts` (realm, secret): `sessionService.rotate` → new access token. `logout.usecase.ts` (secret): revoke. `change-password.usecase.ts` (identityId, current, next, sessionId): verify or 001; policy; store; `revokeAll` except current; `passwordChanged`.
- [x] `social-login.usecase.ts` (provider, token, client): verifier → `{ subject, email, emailVerified }` (not verified → 013); `findByProvider` → identity; else mobile identity by email; else create one (`emailVerifiedAt = now`, no hash, active); `linkProvider` with `email_at_link`; an identity found in `pending_password` (a migrated volunteer) gets `status = active` and `emailVerifiedAt` if null in the same transaction as `linkProvider` (decisions R4); disabled → 004; session. Never sets a password.
- [x] Use cases behind the Layer 7 token and resend routes (decisions R14): `get-token-info.usecase.ts` (secret): `findAnyByLink`; not live → 005; else `{ type, purpose, realm, maskedEmail, organizationName? }`, purpose `transition` when `type = invite AND sentBy IS NULL` (R16). `resend-token.usecase.ts` (secret): `findAnyByLink`; identity not disabled → `issue` a fresh link of the same type and the matching email; always silent, swallows 005 and 010. `resend-verification.usecase.ts` (realm, email): identity found with `emailVerifiedAt` null → web resends `confirmOrganizationLink` (NGO still pending), mobile resends `verifyEmailLink`; always silent, swallows 010.
- [x] `src/modules/auth/services/social/`: `social-token-verifier.service.ts` dispatching to `google.verifier.ts` (`google-auth-library` `verifyIdToken`, `aud` in `GOOGLE_CLIENT_IDS`, `email_verified`), `apple.verifier.ts` (JWKS `https://appleid.apple.com/auth/keys` via `jwks-rsa`, already a dependency; `iss` appleid.apple.com, `aud = APPLE_BUNDLE_ID`), `facebook.verifier.ts` (`GET /debug_token` with `FACEBOOK_APP_ID|FACEBOOK_APP_SECRET`, `app_id` match and `is_valid`; email from `GET /me?fields=id,email`; no email → 013). `npm i google-auth-library`.
- [x] Specs per use case for every branch above, including: web login for an email that only has a mobile identity answers 012 and never runs the dummy hash; suspended NGO → 004; mobile set-password returns `{ realm: 'mobile', email }` and creates no `refresh_token` row; social login on a `pending_password` identity activates it; token info purpose transition vs invite; resend routes silent for unknown emails; verifier specs with recorded fixtures (wrong audience, expired, unverified email), no network.

## Done when

Build, lint, test pass; every AUTH code from the table is reachable from a spec.

## Comments
- 2026-10-30: Layer 6 built locally (uncommitted). Use cases in `src/usecases/auth/`, registered in `use-case.module.ts` (which now imports `AuthenticationModule`); verifiers in `src/modules/auth/services/social/`; `google-auth-library` ^11 installed. Choices worth checking:
  - `ApplyNewPasswordUseCase` is the shared part of set-password and reset-with-code (one transaction: consume, hash, active, `passwordSetAt`, `emailVerifiedAt` if null, counters reset, `revokeAll`; then `passwordChanged`).
  - **A disabled login is refused (AUTH_004) by set-password, confirm-email and social sign-in**: otherwise a still-live link would set `status = active` and undo an admin's Disable.
  - Social sign-in also sets `emailVerifiedAt` on an active but unconfirmed mobile login (the provider has confirmed the address), not only on `pending_password` (R4).
  - `resend-token` sends nothing when the link has nothing left to do: verify_email for a confirmed email, an invite for a login that already has a password. A resent transition link lasts 30 days again; a resent Team invite keeps `sentBy`.
  - Confirm-email for a web login confirms the email and starts a session; activating the pending NGO is Layer 8.
  - Google allows five minutes of clock skew (library default); the spec's expired token is ten minutes old.
  Specs: `auth.usecases.spec.ts` (login branch order incl. R19 without the dummy hash, suspended NGO, lock before password, AUTH_003 after the password; social sign-in incl. R4 and disabled; token purpose R16), `social-verifiers.spec.ts` (tokens signed with throwaway keys, recorded Facebook responses, no network). The flows end to end are in Layer 7's e2e specs. Every AUTH code is reached by a spec: 001 to 010, 012 and 013 in the unit and flow specs, 011 in `guards.e2e-spec.ts`. AUTH_007 is reached only in units: over HTTP the DTO rejects a weak password first (400 without a code).
