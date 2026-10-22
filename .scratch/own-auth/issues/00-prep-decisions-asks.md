# P1 · Record the decisions, send the NGO Hub request, check the Apple team, pick the date

Status: ready-for-human
Type: task
Blocked by: —
Tracker card: P1

Decisions were taken on 6 Oct 2026 and live in the design doc under "Decided". Later decisions (20 to 22 Oct) and the resolution of every review finding (R1 to R36) live in `../decisions.md`, which is newer than both the design doc and the Implementation Guide and wins over them.

## Checklist

- [ ] Ask NGO Hub to point the VIC entry in its app list and the VIC page on ngohub.ro at `WEB_APP_URL` on cutover day; agree the channel for the "switch now" message. Book the day-30 follow-up (remove VIC's app client from their Cognito pool and VIC from their application list).
- [ ] Confirm the Apple developer team that will sign the new build is the one the Cognito Apple federation used (Hide my email relay addresses must match). If not, note it in the Risks row.
- [ ] Create or locate: Google OAuth client ids (iOS, Android, web client used as token audience), Facebook app id and secret, Apple Services id. Record where the secrets live.
- [ ] Count today's social users on a production copy (read-only, R35): `SELECT split_part(cognito_id, '_', 1), count(*) FROM "user" WHERE type = 'regular' AND deleted_on IS NULL GROUP BY 1`. Record the counts under Comments. If any `google`, `facebook` or `signinwithapple` rows exist, `auth:migrate` (Layer 9) must create their `auth_identity_provider` links from the Cognito username. The social buttons have been hidden since 13 December 2023 (`e0cd277d`), so expect few or none.
- [ ] Pick the networks the smoke-test team will work from during the window (office or VPN egress IPs, phones on the same Wi-Fi) and give them to issue 20 for `MAINTENANCE_ALLOWED_IPS` (R2).
- [ ] Generate the RS256 key pair with a `kid` and `AUTH_TOKEN_KEY` per environment (commands in `backend/docs/auth.md`, Layer 3). Pick the cutover date and the 2–4 hour window.

## Comments
