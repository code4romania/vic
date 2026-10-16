# Layer 6 · Auth use cases and social token verifiers

Status: ready-for-agent
Type: task
Blocked by: 06
Tracker card: B3 (part), B8

One class per flow in `src/usecases/auth/`, realm passed as an argument. All registered in `src/usecases/use-case.module.ts`. The login endpoint never sends email.

## Checklist

- [ ] `login.usecase.ts` (realm, email, password, client): unknown email or identity with no hash → verify against a fixed dummy hash, then AUTH_001; disabled → 004; `lockedUntil > now` → 002; wrong password → `registerFailedLogin`, 001; `emailVerifiedAt` null → 003; web realm when only a mobile identity exists → 012; success → `registerSuccessfulLogin`, `createSession`, return tokens and (web) the admin user.
- [ ] `set-password.usecase.ts` (token, password): `peekLink` → `meetsPolicy` or 007 → one transaction: hash, `status = active`, `passwordSetAt`, `emailVerifiedAt` if null, `consume` (ends the other set-password links), `revokeAll` → `createSession` → `passwordChanged` email. Web realm: cookie; mobile realm: tokens in the body so the page can show "Open the app".
- [ ] `reset-password-with-code.usecase.ts` (email, code, password): identity by (mobile, email) → `verifyCode` → same transaction.
- [ ] `forgot-password.usecase.ts` (realm, email): identity found and not disabled → reset_password link (web) or code (mobile) → email. Never throws; swallows AUTH_010.
- [ ] `register-mobile.usecase.ts` (email, password, phone): exists → 009; `meetsPolicy`; identity active with hash, email unverified → `verifyEmailLink` → return `{ maskedEmail, phone }`.
- [ ] `confirm-email.usecase.ts` (token): verify_email link; mobile identity → `emailVerifiedAt`, consume, answer `{ realm: 'mobile' }`. (The NGO branch is added in Layer 8.)
- [ ] `refresh-session.usecase.ts` (realm, secret): `sessionService.rotate` → new access token. `logout.usecase.ts` (secret): revoke. `change-password.usecase.ts` (identityId, current, next, sessionId): verify or 001; policy; store; `revokeAll` except current; `passwordChanged`.
- [ ] `social-login.usecase.ts` (provider, token, client): verifier → `{ subject, email, emailVerified }` (not verified → 013); `findByProvider` → identity; else mobile identity by email; else create one (`emailVerifiedAt = now`, no hash, active); `linkProvider` with `email_at_link`; disabled → 004; session. Never sets a password.
- [ ] `src/modules/auth/services/social/`: `social-token-verifier.service.ts` dispatching to `google.verifier.ts` (`google-auth-library` `verifyIdToken`, `aud` in `GOOGLE_CLIENT_IDS`, `email_verified`), `apple.verifier.ts` (JWKS `https://appleid.apple.com/auth/keys` via `jwks-rsa`, already a dependency; `iss` appleid.apple.com, `aud = APPLE_BUNDLE_ID`), `facebook.verifier.ts` (`GET /debug_token` with `FACEBOOK_APP_ID|FACEBOOK_APP_SECRET`, `app_id` match and `is_valid`; email from `GET /me?fields=id,email`; no email → 013). `npm i google-auth-library`.
- [ ] Specs per use case for every branch above; verifier specs with recorded fixtures (wrong audience, expired, unverified email), no network.

## Done when

Build, lint, test pass; every AUTH code from the table is reachable from a spec.

## Comments
