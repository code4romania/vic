# I1 · terraform-ngohub: auth secrets and env vars, provider credentials, Cognito vars removed, S3 path, Redis policy, web maintenance page

Status: ready-for-human
Type: task
Blocked by: 04
Tracker card: I1

Repo: `/Users/dragos/Projects/terraform-ngohub` (`service_vic.tf`).

- [ ] Backend, staging and production, add: `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_KEY_ID`, `JWT_ACCESS_TTL_SECONDS`, `REFRESH_TTL_DAYS_WEB`, `REFRESH_TTL_DAYS_MOBILE`, `AUTH_TOKEN_KEY`, `WEB_APP_URL`, `CORS_ORIGINS`, `MOBILE_MIN_VERSION` (1.0.19 until the cutover, then 1.1.0), `MAINTENANCE_MODE=false`, `TURNSTILE_SECRET`, `GOOGLE_CLIENT_IDS`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `APPLE_BUNDLE_ID`. Secrets per environment in the secrets manager.
- [ ] Backend, remove (with Layer 9): the six `COGNITO_*` variables and `ONG_HUB_API`. Web build: remove `VITE_AWS_REGION`, `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`, `VITE_COGNITO_OAUTH_DOMAIN`; add `VITE_TURNSTILE_SITE_KEY`, store URLs, `VITE_MIGRATION_NOTICE_UNTIL`. Cognito IAM permissions stay until day 30.
- [ ] S3: the `organizations/` prefix accepts PDFs next to logos.
- [ ] Redis `CONFIG GET maxmemory-policy` = `noeviction` on staging and production.
- [ ] Web maintenance page for the window (host's own or a one-file `maintenance.html`, ro + en); switch steps in the runbook.
- [ ] Apply to staging before the rehearsal, to production before T-1.

## Comments
