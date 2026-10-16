# Own authentication: Cognito + NGO Hub → VIC

Status: in-progress
Branch: feat/own-auth (off main at ac237772)

## Goal

VIC takes over login from AWS Cognito and NGO Hub in one cutover: email + password hashed in Postgres (argon2id), RS256 access tokens, rotating refresh tokens, one-time links for every emailed secret (one exception: the 6-digit code for Forgot password started in the mobile app), Google / Facebook / Apple sign-in on mobile verified server-side, NGO self-registration with super admin validation, and a Team page for admins.

## Source of truth

1. Design doc (decisions, 6 Oct 2026): https://claude.ai/code/artifact/db39a7ad-1dd1-4ea4-b50f-ebc22ada9a7e
2. Implementation Guide (how, layer by layer): https://claude.ai/code/artifact/02645619-109a-4538-9358-b61ffb680134
3. Tasks tracker (cards, build order): https://claude.ai/artifact/3rCLpFBQfRLVnu2VJJnMwm

Where they differ, the design doc wins.

## Build order

Backend first, one issue per layer (`issues/01` to `11`). Each layer compiles, `npm run lint` and `npm run test` pass, and is its own PR. Layers 0–2 can deploy with Cognito still on. From Layer 4 the API rejects Cognito tokens, so Layers 4–10 merge to `main` together at the cutover.

| # | Layer | Issue |
|---|---|---|
| 0 | Scaffolding: Jest mapper, PASSWORD_REGEX, pre-flight SQL | 01 |
| 1 | Database: enums, 4 entities, user/organization changes, migration | 02 |
| 2 | Repositories and AuthIdentityFacade | 03 |
| 3 | Config, argon2, one-time tokens, sessions, rate limits, email builders, error codes | 04 |
| 4 | RS256 strategies, guards, maintenance middleware, cookies, CORS | 05 |
| 5 | DTOs and presenters (the API contract) | 06 |
| 6 | Auth use cases and social token verifiers | 07 |
| 7 | Controllers; adapt the Cognito-dependent use cases | 08 |
| 8 | NGO registration, validation gates, super admin, Team | 09 |
| 9 | Commands, held transition emails, cleanup job, Cognito and NGO Hub removal | 10 |
| 10 | End-to-end suite and CI | 11 |

Then web (`12`–`15`), mobile (`16`–`19`), infrastructure (`20`–`21`), rehearsal and cutover (`22`–`23`), after (`24`–`25`). Prep asks are `00`. Web and mobile issues are outlines until Layer 7 fixes the API contract.

## Definition of done (whole feature)

- Backend e2e suite green on staging against a copy of production; two timed clean rehearsal runs.
- Web and mobile builds against the new API; Update now OTA verified on an old build and absent on the new one.
- Implementation Guide and READMEs describe the system as built.
