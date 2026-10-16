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

## Done when

`cd backend && npm run build && npm run lint && npm run test` all pass, with the one spec listed.

## Comments
