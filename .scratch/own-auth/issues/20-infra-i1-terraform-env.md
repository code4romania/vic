# I1 · terraform-ngohub: auth secrets and env vars, provider credentials, Cognito vars removed, S3 path, Redis policy, maintenance switch, announce deploy

Status: ready-for-human
Type: task
Blocked by: 04
Tracker card: I1

Repo: `/Users/dragos/Projects/terraform-ngohub` (`service_vic.tf`).

- [ ] Backend, staging and production, add: `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_KEY_ID`, `JWT_ACCESS_TTL_SECONDS`, `REFRESH_TTL_DAYS_WEB`, `REFRESH_TTL_DAYS_MOBILE`, `AUTH_TOKEN_KEY`, `WEB_APP_URL`, `CORS_ORIGINS`, `MOBILE_MIN_VERSION` (1.0.19 until the cutover, then 1.1.0), `MAINTENANCE_MODE=false`, `MAINTENANCE_ALLOWED_IPS` (comma separated, the smoke-test team's networks from issue 00, kept as a secret, R2), `TURNSTILE_SECRET`, `GOOGLE_CLIENT_IDS`, `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `APPLE_BUNDLE_ID`. Secrets per environment in the secrets manager.
- [ ] Backend, remove (with Layer 9): the six `COGNITO_*` variables and `ONG_HUB_API`. Web build: remove `VITE_AWS_REGION`, `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`, `VITE_COGNITO_OAUTH_DOMAIN`; add `VITE_TURNSTILE_SITE_KEY`, store URLs, `VITE_MIGRATION_NOTICE_UNTIL`. Cognito IAM permissions stay until day 30.
- [ ] S3: the `organizations/` prefix accepts PDFs next to logos.
- [ ] Redis `CONFIG GET maxmemory-policy` = `noeviction` on staging and production.
- [ ] Maintenance at 0:00 (R1). The old backend has no maintenance switch, so:
  - web: a static maintenance page (host's own or a one-file `maintenance.html`, ro + en) and the exact steps to switch to it and back;
  - backend: the exact command to scale the VIC ECS service to 0 tasks (desired count 0), after which the shared ALB answers 503 for the VIC host. Scale only the VIC service. Never touch the ALB, its listeners or rules: NGO Hub shares it. Write down the normal desired count to scale back to;
  - the new backend is then deployed with `MAINTENANCE_MODE=true` and `MAINTENANCE_ALLOWED_IPS` set; the ALB must pass `X-Forwarded-For` (the backend reads the first hop with `trust proxy` 1). Check from an allow-listed and a non-allow-listed network on staging.
- [ ] Announce PR (R3): deploy the small `main` PR with the `announce` command (no migration, no auth change) to staging and production before T-7. Record the image tag under Comments; it is also the rollback image for the window.
- [ ] Apply to staging before the rehearsal, to production before T-1.

## Comments
