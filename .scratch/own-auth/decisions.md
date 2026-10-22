# Decisions log

This file records every decision made since the design doc of 6 October 2026, and how each finding from `review-2026-10-20.md` is resolved. If this file and the Implementation Guide ever disagree, this file is the newer of the two; fix the Guide.

## Decisions made by Dragos

| Date | Decision |
| --- | --- |
| 2026-10-20 | `feat/own-auth` stays as it is: the two commits `26d1977e` and `466b1798` are Layer 0. |
| 2026-10-20 | Every existing user is sent a transition link to set a new password. We do not migrate passwords lazily through Cognito, because Cognito does not export password hashes. |
| 2026-10-21 | **Local first.** Migrations run only against the local `docker compose` database until the staging rehearsal. Nothing from `feat/own-auth` is merged to `main` or deployed before then, because `migrationsRun: true` applies migrations on boot. The only exception is the small announce PR (R3 below), which contains no migration. |
| 2026-10-21 | Social users choose their own path. They can ignore the transition email and sign in with Google, Facebook or Apple in the new app. The transition email says so. |
| 2026-10-22 | The scope is replacing Cognito and NGO Hub. Volunteers have never come from NGO Hub; the only NGO Hub call is the admin's first web login (`ong-hub.service.ts:29`). An "Add volunteer" button on the web is a separate feature for after the switch. |

## How the review findings are resolved (defaults chosen on 2026-10-22)

These are the defaults chosen so the work can continue. Any of them can be changed before its layer starts.

### Cutover

- **R1. Maintenance at 0:00.** The old backend has no maintenance switch. At 0:00 the web switches to its static maintenance page and the VIC ECS service is scaled to 0 tasks, so the shared ALB answers 503 for the VIC host. Only the VIC service is scaled, never the ALB, because NGO Hub shares it. The new backend is then deployed with `MAINTENANCE_MODE=true`.
- **R2. Smoke test during maintenance.** The maintenance middleware (Layer 4) gets an allow-list, `MAINTENANCE_ALLOWED_IPS` (comma separated). It reads the client IP from the first `X-Forwarded-For` hop, with `app.set('trust proxy', 1)`. Requests from those IPs pass, and everything else gets 503 `MAINTENANCE`. The smoke-test team works from an allow-listed network on web and phones. The rehearsal runs the same way.
- **R3. T-7 and T-1 announcements.** These leave Layer 9. A small PR to `main`, with no migration and no auth change, adds an `announce` command that reads recipients from the `user` table (`deleted_on IS NULL`, deduplicated by `lower(email)`) and sends the announce and reminder emails through the existing mail queue. It is deployed before T-7. Layer 9 keeps only `--release-transition` and the `back` template, which read identities.
- **R4. Social sign-in of migrated volunteers.** When social login matches an existing identity in `pending_password`, it sets `status = active` and sets `emailVerifiedAt` if it is null, in the same transaction as `linkProvider` (Layer 6).
- **R5. Null `userId`.** Done (Guide revision 41, issues 05 and 08).

### A later layer needs something earlier

- **R6. County and city on NGO registration.** Dropped. `RegisterOrganizationDto` and the W3 form keep the free-text address, as in the design's field list. Layer 1 does not change.
- **R7. Event tracking for admins.** The Layer 1 migration adds `DISABLE_ADMIN` and `ENABLE_ADMIN` to the `actions_archive` event enum with `ALTER TYPE`, and Layer 1 adds their `TrackedEventData` shapes.
- **R8. Suspend and unsuspend.** These no longer change identity status. Login (Layer 6) and the web strategy (Layer 4) refuse an admin whose organization is `suspended` (AUTH_004). Admins disabled individually stay disabled, and unsuspending needs no memory of earlier states.
- **R9. Transactions.** Layer 2 methods take an optional `manager?: EntityManager`: identity create, update and upsert; token create; refresh `revokeAllForIdentity`. In Layer 3, `issue(..., manager?)` and `revokeAll(..., manager?)` join the caller's transaction.
- **R10. Missing queries.** Layer 2 adds `findSuperAdmins()`, `findByOrganizationId(orgId)`, the token lookup by hash in any state, `deleteEndedBefore(date)` for tokens, `deleteExpiredOrRevokedBefore(date)` for refresh tokens, and the unverified mobile identities cleanup.
- **R11. Current session for change-password.** `createSession` and `rotate` (Layer 3) put `sid` (the refresh_token id) in the access token. Both strategies (Layer 4) put `identityId` and `sessionId` on `request.user`.
- **R12. Packages.** Layer 3 installs `semver` and `@types/semver`, and adds an optional `REDIS_KEY_PREFIX` used as the ioredis `keyPrefix`, set to `test:` in `.env.test`.
- **R13. Test harness.** The 10.1 harness (`vic_test` database, `.env.test`, Jest `setupFiles`, `test/setup.ts`, a fake MailService, a token-minting helper) moves to Layer 3. Layer 8's gate check uses a confirmed but unvalidated NGO, because a pending NGO's admin cannot log in.
- **R14. Use cases behind Layer 7 routes.** Layer 6 adds `get-token-info`, `resend-token` and `resend-verification` (realm aware: the web resends `confirmOrganizationLink`, mobile resends `verifyEmailLink`, always silent). Layer 3 adds `OneTimeTokenService.findAnyByLink(secret)`.
- **R15. Web resend of the NGO confirmation.** Layer 5 adds a shared `ResendVerificationDto { email }`. Layer 7 adds public, throttled `POST /auth/web/resend-verification`, which always answers 200.
- **R16. Transition link or invite.** `TokenInfoPresenter` gets `purpose: 'transition' | 'invite' | 'reset' | 'verify_email'`, where transition means `type = invite AND sent_by IS NULL`.
- **R17. Deep link email.** The mobile-realm answers of `POST /auth/set-password` and `POST /auth/confirm-email` are `{ realm: 'mobile', email }`. Mobile-realm set-password creates no session.

### Contradictions and smaller fixes

- **R18. Disabled identity.** Its tokens are rejected on the next request (Layer 4 behaviour). The Layer 10 e2e test and `backend/docs/auth.md` say the same.
- **R19. Login order.** For the web realm with no web identity, login checks for a mobile identity first and answers AUTH_012, before the dummy-hash AUTH_001 branch.
- **R20. Enabling an admin.** This sends no invite. An enabled admin who has no password gets one through Send invite. This is a design deviation.
- **R21. Link hash.** It is bound to the type only (`HMAC(key, type:secret)`). Codes are also bound to the identity. This is a recorded deviation from the design, which said links are bound to `identity_id`.
- **R22. Old-app monitoring.** Old builds send no `x-app-version`, so old-app traffic is tracked as 401s on `/mobile/*` without that header. AUTH_011 is only for future version bumps.
- **R23. Web refresh.** The web refreshes on a 401 from any route except the public auth routes (login, refresh, logout, forgot-password, `token/*`, set-password, confirm-email, resend-verification).
- **R24. jwks-rsa.** It stays, because the Apple verifier needs it. This corrects the design doc.
- **R25. Contract fixed.** The `/auth` routes are fixed at Layer 7, and the organization, Team and super admin routes at Layer 8. Web issues 13 and 14 are blocked by Layer 8 (issue 09).
- **R26. Swagger.** The check moves from Layer 5 to Layers 7 and 8.
- **R27. Logos.** Stored as S3 keys under `organizations/<id>/`. A shared helper in the organization transformer presigns a key and passes through a value starting with `http`, which covers the legacy NGO Hub URLs. Every presenter that emits `logo` goes through it.
- **R28. RolesGuard.** The global `RolesGuard` runs before the controller JWT guards, so `@Roles` stays unusable. Super admin checks use `SuperAdminGuard`, listed after the JWT guard.
- **R29. Web routes.** `/` renders Landing when logged out and the dashboard when logged in. There is no `PublicRoute` wrapper on `/`.
- **R30. Mobile `AuthContext.ts`.** A2 replaces `CognitoHostedUIIdentityProvider` with a local `'google' | 'facebook' | 'apple'` union and removes `confirmSignUp`.
- **R31. Email templates.** The footer and `MailService` already supply `contactEmail`, and `faq-tc` is not rendered. Layer 9 only adds the `{{#if code}}` block. The Layer 3 strict-render spec supplies `contactEmail` and registers the `asset_url` helper.
- **R32. Paths.** `IRoute` lives in `frontend/src/common/interfaces/route.interface.ts`. `FileUpload` gets a `pdf` accept mode for the statute.
- **R33. Error codes.** Layer 8 adds ORG_006 (Turnstile failed) and ORG_007 (statute missing or not a PDF). Duplicates reuse ORG_004.
- **R34. Regression check.** The rehearsal smoke test and the web checklist add the Volunteers, Access requests, Access codes, Contracts and Activity log pages.
- **R35. Social users today.** The pre-flight adds `SELECT split_part(cognito_id, '_', 1), count(*) FROM "user" WHERE type = 'regular' AND deleted_on IS NULL GROUP BY 1`. If it finds `google`, `facebook` or `signinwithapple` rows, `auth:migrate` creates their `auth_identity_provider` links from the Cognito username. The social buttons have been hidden since 13 December 2023 (`e0cd277d`), so there are probably few or none.
- **R36. Transition email wording.** The volunteer version says: "Set a password with this link, or sign in with Google, Facebook or Apple in the app as before."
- **R37. Web during the window.** At 0:00 the web shows its static maintenance page. At 0:45 the new web build replaces it. Until 2:00, every request from outside the allow-list gets 503 `MAINTENANCE` from the API, and both the web and the app show a maintenance message on that response.
