# ADR 0001: VIC owns its authentication (replacing Cognito and NGO Hub)

- Status: accepted, 6 October 2026
- Deciders: VIC team (Commit Global / Code for Romania)
- Overview: https://claude.ai/artifact/53tayCyzL6u5FEFnMGyVw7
- Design doc: https://claude.ai/code/artifact/db39a7ad-1dd1-4ea4-b50f-ebc22ada9a7e
- Implementation Guide: https://claude.ai/code/artifact/02645619-109a-4538-9358-b61ffb680134
- Work items: `.scratch/own-auth/`
- Later decisions and review resolutions: `.scratch/own-auth/decisions.md`

## Context

Admins log in through NGO Hub's Cognito user pool and are created in VIC on their first login from NGO Hub data; volunteers log in through VIC's own Cognito pool via Amplify. NGO Hub owns NGO approval and admin access; removing an admin there never reaches VIC. Passwords cannot be exported from Cognito. The mobile app stores Cognito tokens unencrypted and has no 401 handling or version gate.

## Decision

VIC takes over login in one cutover of a few hours. The backend verifies email + password itself (argon2id), issues RS256 access tokens (15 minutes, `aud` vic-web or vic-mobile) and rotating refresh tokens (7 days web in an httpOnly cookie, 30 days mobile in secure storage), and keeps logins, sessions and one-time links in Postgres. Redis holds only rate-limit counters and queues.

Settled points: one cutover, no parallel run, full rollback until go / no-go; NGOs register directly in VIC, nothing synced with NGO Hub; a new NGO is usable once its first admin confirms their email and a VIC super admin validates it afterwards; every emailed secret is a link, except Forgot password started in the mobile app, which is a 6-digit code; the transition link at the cutover lasts 30 days, Team page invites 14 days; setting a password ends every other set-password link; password rules as Cognito enforced them; Cloudflare Turnstile on NGO registration only; a minimal public landing page; a Send invite button on the Team page, nothing re-sent in bulk; "managers" are called admins.

| # | Decision | Chosen |
|---|---|---|
| 1 | What validation gates | An unvalidated NGO is hidden from the app's organization list, search and access codes, cannot create an event, and no hours can be logged for it. Enforced by the backend. |
| 2 | Who the super admins are | A `super_admin` flag on an ordinary admin login, set with `auth:super-admin <email>`, plus a review page only they see. |
| 3 | Admins who lost access in NGO Hub | Every admin in the `user` table is imported active and gets the transition email. Each NGO reviews its Team page. No list is requested from NGO Hub. |
| 4 | Registration form fields | VIC's seven fields plus the tax ID (CUI) and the NGO's statute as a PDF upload stored in S3. |
| 5 | Mobile token storage | `expo-secure-store`; the runtime-version policy changes to `appVersion` in the new build. |
| 6 | Back into the app after a link | The web page opens the app through `vic://` with the store links as fallback. No universal links. |
| 7 | Social login | Google, Facebook and Apple stay in the mobile app, rebuilt against the VIC backend with server-side token verification. Apple is mandatory. The web has none. |

## Consequences

- Four new tables (`auth_identity`, `auth_token`, `refresh_token`, `auth_identity_provider`); `user.cognito_id` becomes nullable and is dropped at day 30; `organization` gains status, validation and statute columns.
- Every existing user is logged out once and emailed a 30-day link to set a password; the old password fails like any wrong password and the login endpoint never sends email.
- Old mobile builds stop working at the cutover; they receive one last over-the-air "Update now" banner. The new build must change its runtime-version policy so the two never share updates.
- VIC inherits two jobs NGO Hub did: vetting NGOs (super admin validation) and removing admins (Team page). Ex-employees imported active keep access until their NGO disables them; the admin transition email says so.
- The backend is built in eleven layers, each its own PR; Layers 0 to 2 can deploy with Cognito on, Layers 4 to 10 deploy together at the cutover (superseded 2026-10-21 by local first, see Amendments: nothing from feat/own-auth reaches main before the rehearsal, and the whole branch, Layers 0 to 10, reaches main together).

## Amendments (2026-10-20 to 2026-10-22)

Full text and the resolution of every review finding (R1 to R36) are in `.scratch/own-auth/decisions.md`.

- **Password links for all (2026-10-20).** Every existing user gets a transition link to set a new password. No lazy migration through Cognito: it does not export password hashes.
- **Local first (2026-10-21).** Migrations run only against the local database until the staging rehearsal; nothing from `feat/own-auth` is merged to `main` or deployed before then, because `migrationsRun: true` applies migrations on boot. The only exception is a small announce PR with no migration, deployed before T-7. This replaces the last Consequence above: Layers 0 to 2 no longer deploy early.
- **Social users choose (2026-10-21).** A social user may ignore the transition email and sign in with Google, Facebook or Apple in the new app; the email says so.
- **Scope (2026-10-22).** Replace Cognito and NGO Hub only. Volunteers never came from NGO Hub; an "Add volunteer" button on the web is a separate feature after the switch.
- **Maintenance (R1, R2).** At 0:00 the VIC ECS service is scaled to 0 (never the shared ALB) and the web shows a static page; the new backend starts with `MAINTENANCE_MODE=true` and lets only `MAINTENANCE_ALLOWED_IPS` through for the smoke test.

Recorded deviations from the design:

- **R20.** Enabling an admin sends no invite; an enabled admin with no password gets one through Send invite.
- **R21.** A link's hash is bound to its type only (`HMAC(key, type:secret)`), not to `identity_id`; codes are still bound to the identity.
- **R24.** `jwks-rsa` stays, because the Apple token verifier needs it.
