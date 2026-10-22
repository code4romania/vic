# Layer 0 · Scaffolding: Jest mapper, PASSWORD_REGEX, pre-flight SQL

Status: ready-for-agent
Type: task
Blocked by: —
Tracker card: B1 (part)

No runtime change. Makes `npm run test` work for the first time and records the data checks the cutover needs.

## Checklist

- [ ] Branch `feat/own-auth` off `main` (`ac237772`); commit `CLAUDE.md`, `docs/agents/*`, `.scratch/own-auth/*`.
- [ ] `backend/package.json` jest block: `moduleNameMapper: { "^src/(.*)$": "<rootDir>/$1" }`. `backend/test/jest-e2e.json`: `"^src/(.*)$": "<rootDir>/../src/$1"`. Delete `backend/test/app.e2e-spec.ts` (Nest boilerplate, cannot pass).
- [ ] `PASSWORD_REGEX` in `backend/src/common/constants/constants.ts`, same rule as `REGEX.COGNITO_PASSWORD` in `mobile/src/common/constants/constants.ts`; `constants.spec.ts` next to it (accepts `Volunteer#2026`; rejects `password`, `PASSWORD`, `Pass1`, a 257-character string, leading or trailing space).
- [ ] `backend/scripts/auth-preflight.sql`: duplicate emails per user type ignoring case; admins with `organization_id IS NULL`; emails with spaces or no `@`; organizations sharing a name, email or phone ignoring case. Run once on a production copy and paste the counts under Comments.
- [ ] Add the social-user count to `auth-preflight.sql` (decisions R35): `SELECT split_part(cognito_id, '_', 1), count(*) FROM "user" WHERE type = 'regular' AND deleted_on IS NULL GROUP BY 1`. Rows for `google`, `facebook` or `signinwithapple` mean `auth:migrate` (Layer 9, issue 10) must create their `auth_identity_provider` links from the Cognito username. The social buttons have been hidden since 13 December 2023 (`e0cd277d`), so expect few or none. This query is not in `26d1977e` yet.

## Done when

`cd backend && npm run build && npm run lint && npm run test` all pass, with the one spec listed. The pre-flight counts, including the R35 social-user count, are pasted under Comments.

## Comments

- 2026-10-16: Layer 0 code (Jest mapper, PASSWORD_REGEX + spec, pre-flight SQL) and a lint-baseline cleanup were committed on `feat/own-auth` as `26d1977e` and `466b1798` before Dragos asked to hold code changes. Decision pending: keep as Layer 0, or reset the branch and keep only the docs and issue files. Docs added without code: `docs/adr/0001-own-authentication.md`, `CONTEXT.md`, `backend/docs/auth.md`.
- 2026-10-22: Dragos decided on 20 Oct to keep both commits as Layer 0 (see ../decisions.md).
