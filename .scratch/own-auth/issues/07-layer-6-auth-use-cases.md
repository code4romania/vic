# Layer 6 · Auth use cases and social token verifiers

Status: ready-for-agent
Type: task
Blocked by: 06
Tracker card: B3 (part), B8

One class per flow in `src/usecases/auth/`, realm passed as an argument. All registered in `src/usecases/use-case.module.ts`. The login endpoint never sends email.

## Checklist

- [ ] `login.usecase.ts` (realm, email, password, client), in this order: web realm with no web identity → look for a mobile identity first and answer 012 (decisions R19); unknown email or identity with no hash → verify against a fixed dummy hash, then AUTH_001; disabled → 004; web identity whose organization is `suspended` → 004 (decisions R8); `lockedUntil > now` → 002; wrong password → `registerFailedLogin`, 001; `emailVerifiedAt` null → 003; success → `registerSuccessfulLogin`, `createSession`, return tokens and (web) the admin user.
- [ ] `set-password.usecase.ts` (token, password): `peekLink` → `meetsPolicy` or 007 → one transaction (`manager` passed to the facade, `consume` and `revokeAll`, decisions R9): hash, `status = active`, `passwordSetAt`, `emailVerifiedAt` if null, `consume` (ends the other set-password links), `revokeAll` → `passwordChanged` email. Web realm: `createSession`, cookie. Mobile realm: no session; answer `{ realm: 'mobile', email }` so the page can show "Open the app" with the email (decisions R17).
- [ ] `reset-password-with-code.usecase.ts` (email, code, password): identity by (mobile, email) → `verifyCode` → same transaction.
- [ ] `forgot-password.usecase.ts` (realm, email): identity found and not disabled → reset_password link (web) or code (mobile) → email. Never throws; swallows AUTH_010.
- [ ] `register-mobile.usecase.ts` (email, password, phone): exists → 009; `meetsPolicy`; identity active with hash, email unverified → `verifyEmailLink` → return `{ maskedEmail, phone }`.
- [ ] `confirm-email.usecase.ts` (token): verify_email link; mobile identity → `emailVerifiedAt`, consume, answer `{ realm: 'mobile', email }` (decisions R17), no session. (The NGO branch is added in Layer 8.)
- [ ] `refresh-session.usecase.ts` (realm, secret): `sessionService.rotate` → new access token. `logout.usecase.ts` (secret): revoke. `change-password.usecase.ts` (identityId, current, next, sessionId): verify or 001; policy; store; `revokeAll` except current; `passwordChanged`.
- [ ] `social-login.usecase.ts` (provider, token, client): verifier → `{ subject, email, emailVerified }` (not verified → 013); `findByProvider` → identity; else mobile identity by email; else create one (`emailVerifiedAt = now`, no hash, active); `linkProvider` with `email_at_link`; an identity found in `pending_password` (a migrated volunteer) gets `status = active` and `emailVerifiedAt` if null in the same transaction as `linkProvider` (decisions R4); disabled → 004; session. Never sets a password.
- [ ] Use cases behind the Layer 7 token and resend routes (decisions R14): `get-token-info.usecase.ts` (secret): `findAnyByLink`; not live → 005; else `{ type, purpose, realm, maskedEmail, organizationName? }`, purpose `transition` when `type = invite AND sentBy IS NULL` (R16). `resend-token.usecase.ts` (secret): `findAnyByLink`; identity not disabled → `issue` a fresh link of the same type and the matching email; always silent, swallows 005 and 010. `resend-verification.usecase.ts` (realm, email): identity found with `emailVerifiedAt` null → web resends `confirmOrganizationLink` (NGO still pending), mobile resends `verifyEmailLink`; always silent, swallows 010.
- [ ] `src/modules/auth/services/social/`: `social-token-verifier.service.ts` dispatching to `google.verifier.ts` (`google-auth-library` `verifyIdToken`, `aud` in `GOOGLE_CLIENT_IDS`, `email_verified`), `apple.verifier.ts` (JWKS `https://appleid.apple.com/auth/keys` via `jwks-rsa`, already a dependency; `iss` appleid.apple.com, `aud = APPLE_BUNDLE_ID`), `facebook.verifier.ts` (`GET /debug_token` with `FACEBOOK_APP_ID|FACEBOOK_APP_SECRET`, `app_id` match and `is_valid`; email from `GET /me?fields=id,email`; no email → 013). `npm i google-auth-library`.
- [ ] Specs per use case for every branch above, including: web login for an email that only has a mobile identity answers 012 and never runs the dummy hash; suspended NGO → 004; mobile set-password returns `{ realm: 'mobile', email }` and creates no `refresh_token` row; social login on a `pending_password` identity activates it; token info purpose transition vs invite; resend routes silent for unknown emails; verifier specs with recorded fixtures (wrong audience, expired, unverified email), no network.

## Done when

Build, lint, test pass; every AUTH code from the table is reachable from a spec.

## Comments
