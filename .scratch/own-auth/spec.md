# Own authentication: Cognito + NGO Hub → VIC

Status: in-progress
Branch: feat/own-auth (off main at ac237772)

## Goal

VIC takes over login from AWS Cognito and NGO Hub in one cutover: email + password hashed in Postgres (argon2id), RS256 access tokens, rotating refresh tokens, one-time links for every emailed secret (one exception: the 6-digit code for Forgot password started in the mobile app), Google / Facebook / Apple sign-in on mobile verified server-side, NGO self-registration with super admin validation, and a Team page for admins.

## Source of truth

0. Overview and decisions (plain language, diagrams, 22 Oct 2026): https://claude.ai/artifact/53tayCyzL6u5FEFnMGyVw7, read first
1. Design doc (decisions, 6 Oct 2026): https://claude.ai/code/artifact/db39a7ad-1dd1-4ea4-b50f-ebc22ada9a7e
2. Implementation Guide (how, layer by layer): https://claude.ai/code/artifact/02645619-109a-4538-9358-b61ffb680134
3. Tasks tracker (cards, build order): https://claude.ai/artifact/3rCLpFBQfRLVnu2VJJnMwm

Where they differ, `decisions.md` wins, then the design doc, then the Guide.

## Decisions since 6 Oct

Every decision taken after the design doc, and the resolution (R1 to R36) of each finding in `review-2026-10-20.md`, is in `decisions.md`. The user flows and the switch (environments, cutover steps, local-first rule) are in `flows.md`. The issue files already include the R items for their layer; read `decisions.md` before starting a layer.

## Build order

Backend first, one issue per layer (`issues/01` to `11`). Each layer compiles, `npm run lint` and `npm run test` pass, and is its own PR into `feat/own-auth`. Local first (decided 21 Oct 2026): every migration runs only against the local `docker compose` database until the staging rehearsal, and nothing from `feat/own-auth` is merged to `main` or deployed before it, because `migrationsRun: true` applies migrations on boot. Layers 0 to 3 change nothing users see; from Layer 4 the API rejects Cognito tokens, so the whole branch (Layers 0 to 10) reaches `main` together, after the rehearsal. The one exception is the small announce PR to `main` (decisions R3): the T-7 and T-1 emails, no migration, no auth change, deployed before T-7. See `flows.md` for the flows and the switch.

| # | Layer | Issue |
|---|---|---|
| 0 | Scaffolding: Jest mapper, PASSWORD_REGEX, pre-flight SQL | 01 |
| 1 | Database: enums, 4 entities, user/organization changes, migration | 02 |
| 2 | Repositories and AuthIdentityFacade | 03 |
| 3 | Config, argon2, one-time tokens, sessions, rate limits, email builders, error codes, test harness | 04 |
| 4 | RS256 strategies, guards, maintenance middleware, cookies, CORS | 05 |
| 5 | DTOs and presenters (the API contract) | 06 |
| 6 | Auth use cases and social token verifiers | 07 |
| 7 | Controllers; adapt the Cognito-dependent use cases | 08 |
| 8 | NGO registration, validation gates, super admin, Team | 09 |
| 9 | Commands (migrate, release transition, `back`), held transition emails, cleanup job, Cognito and NGO Hub removal | 10 |
| 10 | End-to-end suite and CI | 11 |

Then web (`12`–`15`), mobile (`16`–`19`), infrastructure (`20`–`21`), rehearsal and cutover (`22`–`23`), after (`24`–`25`). Prep asks are `00`. Mobile issues are outlines until Layer 7 fixes the `/auth` contract; web issues 13 and 14 wait for Layer 8, which fixes the organization, Team and super admin routes (decisions R25).

## Definition of done (whole feature)

- Backend e2e suite green on staging against a copy of production; two timed clean rehearsal runs.
- Web and mobile builds against the new API; Update now OTA verified on an old build and absent on the new one.
- Implementation Guide and READMEs describe the system as built.
