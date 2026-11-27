# VIC domain glossary

Single-context repo: the backend, web app and mobile app share one vocabulary. Terms below are the ones to use in code, issues, tests and docs. Decisions live in `docs/adr/`.

## People

- **Admin**: a person who manages an NGO in the web app. The code already says `UserType.ADMIN`. NGO Hub called them *managers*; do not use that word.
- **Volunteer**: a person using the mobile app (`UserType.REGULAR`). A volunteer has a *profile* (the `user` row and its personal data) that may not exist yet right after sign-up.
- **Super admin**: a VIC team member who validates and suspends NGOs. An ordinary admin login with the `super_admin` flag set by the `auth:super-admin` command.

## Login

- **Identity**: one login, one row in `auth_identity`: a realm, an email, a status (`pending` until the first login, `active`, `disabled`) and a link to the profile (`user_id`). Since VIC 2.0 (#514) there are no passwords: admins log in with an emailed link, volunteers with an emailed code. A login exists before its profile, and one email can be both an admin and a volunteer, so the login is not stored on `user`.
- **Realm**: which app a login belongs to, `web` (admins) or `mobile` (volunteers). Access tokens carry it as the audience `vic-web` or `vic-mobile`; a token for one realm never opens the other.
- **Access token**: a 15-minute RS256 JWT sent with every request. Not stored.
- **Session**: one logged-in browser or phone, one row in `refresh_token`. The refresh token rotates on every use; a replayed old token revokes the session. "Log out everywhere" revokes every session of an identity.
- **One-time link** (or token): an emailed secret stored as a keyed hash in `auth_token`, used once, with an expiry. Types: `verify_email` (24 h), `reset_password` (1 h as a link, 15 min as a code), `invite` (14 days from the Team page, 30 days from the cutover script). One live token per identity and type; a newer one replaces the older.
- **Purpose** (of a link): what a one-time link is for, as the set-password page shows it: `transition`, `invite`, `reset` or `verify_email`. A transition link is an `invite` token with no sender (`sent_by` empty).
- **Code**: the 6-digit form of a one-time token, used only for Forgot password started in the mobile app. Five wrong attempts end it.
- **Invite**: an `invite` token for someone who has an account but no password yet. Sent when an admin is added, re-sent with *Send invite*, and sent to everyone at the cutover as the **transition link**.
- **Lockout**: five wrong passwords lock an identity for 15 minutes (AUTH_002).
- **Social sign-in**: Google, Facebook or Apple in the mobile app; the provider's token is verified server-side and linked to the mobile identity in `auth_identity_provider`.

## Login with NGO Hub

- **Login with NGO Hub**: "Continuă cu NGO Hub" on the web login, for NGO admins. NGO Hub (OpenID Connect, issuer `NGOHUB_ISSUER`) only says who the person is and which organization they belong to; VIC decides what they get ([ADR 0002](docs/adr/0002-login-with-ngohub.md)). Not in the mobile app.
- **NGO Hub link**: an `auth_identity_provider` row with provider `ngohub` and the NGO Hub user id as subject, on a web login. One NGO Hub account per VIC login and the other way round.
- **NGO Hub organization id**: `organization.ngohub_organization_id`, set when an NGO is first matched (by exact normalized CUI), registers from NGO Hub, or is linked by `ngohub:link-orgs`. Matching never uses name, email or phone.
- **Joining as admin**: an NGO Hub admin of an organization VIC knows, without a VIC login, becomes its admin at the first NGO Hub login. An NGO Hub employee is told to ask for an invite.
- **"Nu am fost noi"** (it was not us): the email every other admin gets when someone joins as admin; its link (`ngohub_revoke` token, 30 days, single use) disables that admin.
- **Registration ticket**: what an NGO Hub admin of an NGO VIC does not know gets instead of a session: 30 minutes, single use, bound to the browser, holding the NGO Hub data. The **prefilled form** (`/register/ngohub`) shows CUI, name and admin email locked; the NGO starts active and validated.

## Organizations

- **Organization** (NGO): status `pending` (registered, email not yet confirmed), `active`, or `suspended`. Separately, **validated** means a super admin reviewed it (`validated_at` set).
- **Validation gates**: an active but unvalidated NGO is hidden from volunteers (list, search, access codes), cannot create an event, and no hours can be logged for it. Everything else works for its admins under a banner.
- **Statute**: the NGO's founding document (statut), uploaded as a PDF at registration and shown to the super admin.
- **Team page**: where admins add colleagues, re-send invites, and disable or enable each other.

## Transition

- **Cutover**: the one maintenance window in which the API switches from Cognito to its own login, the migration script creates identities, and the transition emails are released.
- **Maintenance allow-list**: the IP addresses in `MAINTENANCE_ALLOWED_IPS` that still reach the API while `MAINTENANCE_MODE` is on, so the smoke-test team can test before maintenance is lifted. Everyone else gets 503 `MAINTENANCE`.
- **Pre-flight**: the SQL checks in `backend/scripts/auth-preflight.sql` that must return zero rows before the cutover migration.
- **Update now OTA**: the last over-the-air update for the old mobile app, showing only a banner with the store links.
