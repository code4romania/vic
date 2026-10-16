# P1 · Record the decisions, send the NGO Hub request, check the Apple team, pick the date

Status: ready-for-human
Type: task
Blocked by: —
Tracker card: P1

Decisions were taken on 6 Oct 2026 and live in the design doc under "Decided". Where the Implementation Guide said otherwise it has been rewritten; the design doc wins.

## Checklist

- [ ] Ask NGO Hub to point the VIC entry in its app list and the VIC page on ngohub.ro at `WEB_APP_URL` on cutover day; agree the channel for the "switch now" message. Book the day-30 follow-up (remove VIC's app client from their Cognito pool and VIC from their application list).
- [ ] Confirm the Apple developer team that will sign the new build is the one the Cognito Apple federation used (Hide my email relay addresses must match). If not, note it in the Risks row.
- [ ] Create or locate: Google OAuth client ids (iOS, Android, web client used as token audience), Facebook app id and secret, Apple Services id. Record where the secrets live.
- [ ] Generate the RS256 key pair with a `kid` and `AUTH_TOKEN_KEY` per environment (commands in `backend/docs/auth.md`, Layer 3). Pick the cutover date and the 2–4 hour window.

## Comments
