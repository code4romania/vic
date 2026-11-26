# ADR 0002: Login with NGO Hub for NGO admins (OIDC)

- Status: accepted, 25 November 2026 (decisions by Andrew); implemented 26 November 2026
- Deciders: VIC and NGO Hub team (Commit Global / Code for Romania)
- Work items: `.scratch/ngohub-oidc/` (spec and issues 01–07); the NGO Hub side is on `code4romania/onghub`, issues O0–O16
- Builds on: [ADR 0001](0001-own-authentication.md)

## Context

ADR 0001 took VIC off NGO Hub's Cognito: VIC owns its logins. NGO Hub is now dropping Cognito too and becomes an OpenID Connect provider (`id.ngohub.ro`, staging `id-staging.ngohub.ro`). Many NGOs already keep their data in NGO Hub, and their admins asked to reach VIC without a second account.

## Decision

VIC adds "Continuă cu NGO Hub" on the web login, next to the emailed link and Google / Apple. NGO Hub is **only an identity provider**: it says who the person is, whether the email is verified, and which organization they belong to, with their role there. VIC decides what they get.

| # | Decision | Chosen |
|---|---|---|
| 1 | Flow | Authorization code + PKCE (S256) + client secret (`client_secret_basic`), server side. The flow is bound to the browser by an httpOnly cookie whose hash Redis keeps next to state, nonce and PKCE verifier for 10 minutes, deleted on use. The ID token is checked against NGO Hub's JWKS; the profile comes from `/oidc/me` and must have the same `sub`. RFC 9207 `iss` is checked. |
| 2 | Account linking | By `(ngohub, sub)` in `auth_identity_provider`, else by the verified email, and only when the VIC login's organization is the NGO Hub organization (its NGO Hub id, else the exact normalized CUI). A login already linked to another `sub` is refused (AUTH_018). Only web logins count: a volunteer's app login with the same email does not matter. |
| 3 | NGO Hub admin of an NGO VIC knows, without a VIC login | Joins as admin automatically (decision 4 of 25 November). Matching is by NGO Hub id or exact normalized CUI only, never name, email or phone. Every other admin gets a "nu am fost noi" email whose link disables the new admin at once (30 days, single use, never resent); both events go to the actions history. |
| 4 | NGO Hub employee without a VIC login | Refused (AUTH_017): ask an admin for an invite. Nothing is created. |
| 5 | NGO Hub admin of an NGO VIC does not know | A 30-minute registration ticket (Redis, single use, same browser) and a form prefilled from NGO Hub. CUI, name and admin email come only from the ticket. The NGO starts active and validated, linked to its NGO Hub id; only the terms are ticked, no self-declaration. |
| 6 | Session after an NGO Hub login | An ordinary VIC web session (7 days), like Google / Apple. No short session, no back-channel logout. After a VIC logout the next NGO Hub login sends `prompt=login`. |
| 7 | Data copied from NGO Hub | Only fields VIC already has: contact, address (NGO Hub's `address`, city and county), description, website, logo. The logo is copied server side only from `NGOHUB_LOGO_HOSTS`. No social-media columns. |
| 8 | Organizations from before | `ngohub:link-orgs` links them from NGO Hub's export (`oidc:export-orgs`): dry run by default, `--apply` writes only exact CUI matches; similar name, email or phone only go into the report. |

## Consequences

- A compromised NGO Hub admin account of an NGO can become a VIC admin of that NGO without a VIC admin approving it. The "nu am fost noi" email, the history entries and the CUI-only matching are the safeguards; the stricter alternative (an existing VIC admin approves) was not chosen.
- An NGO registered through NGO Hub skips VIC's super-admin validation: NGO Hub already vouches for it.
- The NGO Hub link is per environment: each environment has one `NGOHUB_ISSUER`, so a staging `sub` or organization id never reaches a production database.
- Open: an admin demoted to employee in NGO Hub keeps their VIC admin role (question 16); super admins are not emailed about NGO Hub registrations; a failed registration uses up its ticket (the person logs in with NGO Hub again).
