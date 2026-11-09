# W3 · Web: NGO registration, validation banner, super admin review, Team, full organization edit

Status: done locally (2026-11-06)
Type: task
Blocked by: 12, 09
Tracker card: W3

Outline until Layer 8 (issue 09) fixes the organization, Team and super admin routes (R25). `../decisions.md` wins over this text and over the Guide.

- `/register` (`RegisterOrganization.tsx`): organization card + first-admin card; the address stays a free-text field, as in the design's field list (no county or city select, R6); `FileUpload` for the logo (`image`) and the statute in a new `pdf` accept mode (PDF only, size shown, R32); Turnstile widget; multipart `POST /organizations/register` as in `src/services/event/event.api.ts`; messages for ORG_004 (duplicate, 409), ORG_006 (Turnstile failed) and ORG_007 (statute missing or not a PDF) (R33); success screen with the masked email.
- Validation banner on every private page while `organization.validatedAt` is null.
- `/admin/validation` (`OrganizationValidation.tsx`): `DataTableComponent`, Validate / Suspend with `ConfirmationModal`; menu entry only when `isSuperAdmin`; 403 page for plain admins. Suspending blocks every admin of the NGO at login (AUTH_004) without changing their individual status; unsuspending restores them (R8).
- `/organization/team` (`Team.tsx`): table with status badge, last login, last invite; Send invite (pending statuses only), Disable / Enable (not on yourself); Add admin `Modal`. Enable sends no invite; an enabled admin with no password gets one through Send invite (R20).
- Menu: `roles?` on `IRoute` in `frontend/src/common/interfaces/route.interface.ts` (R32), the routes themselves in `src/common/constants/routes.ts`; one `useVisibleRoutes()` hook used by `SideMenu.tsx` and `SlidingMenu.tsx`.
- `EditOrganization.tsx`: every field, logo and statute replacement; `organization.api.ts` `updateOrganization(data, files?)` multipart; `IOrganization` + status, validatedAt, taxId, website, statuteUrl.
- Translations `register_organization`, `validation`, `team`, with one message per ORG code used above.

## Comments

- 2026-11-06: built and tested locally, no PR.
  - `/register` (`RegisterOrganization.tsx`, under `PublicRoute`): organization card (shared `components/OrganizationFields.tsx`: fields, yup rules mirroring backend `organization-fields.ts`, logo + statute uploads), first-admin card, terms checkbox (links from new optional `VITE_TERMS_URL` / `VITE_PRIVACY_URL`), `components/Turnstile.tsx` (explicit render, no package; a fresh widget after every failed submit, the token is single use). ORG_004 / ORG_006 → message, ORG_007 → under the statute, AUTH codes via `getAuthErrorCode`. Success: "Confirm your email to activate <org>" + masked email.
  - `FileUpload`: `pdf` mode, `hint`, `maxSize`, `rejectedMessage` (wrong type or too big is shown instead of being dropped silently); `image` now accepts .png as image/png.
  - Validation banner: `components/ValidationBanner.tsx` in `MainLayout`, reads `useOrganizationQuery`. ORG_005 from any page (events, hours) is mapped in `ErrorClass` as a shared fallback, so every error class shows it.
  - `/admin/validation` (`OrganizationValidation.tsx`): logo, website, CUI, registered on, first admin, statute link, Validate / Suspend with `ConfirmationModal`, toasts; `Forbidden.tsx` for plain admins. Validate/suspend also invalidate `['organization']`.
  - `/organization/team` (`Team.tsx`): status badge (invite_sent with days left, invite_expired, disabled, no_login), last login, last invite (+ by, or "VIC (noua autentificare)" for the transition link), row menu: Send invite (invite_sent, invite_expired, no_login), Disable/Enable (never on yourself), Add admin modal.
  - Menu: `roles?` on `IRoute`/`IChildRoute`, Organization gets children Profile + Team, Validation entry `roles: ['super_admin']`; `hooks/useVisibleRoutes.ts` (+ `findParentRoute`, so `/admin/validation` highlights) used by `SideMenu` and `SlidingMenu`.
  - `EditOrganization.tsx`: every field + new logo + new statute, multipart `updateOrganization(data, files)`; `Organization.tsx` shows CUI, website, status, validated on, statute link. `IOrganization` + status, validatedAt, taxId, website, statuteUrl. ONGHub wording removed from translations.
  - Services: `services/team/*`, `services/admin/admin-organizations.*`, `registerOrganization` / `updateOrganization` in `organization.api.ts`. Translations `register_organization`, `team`, `validation`, `forbidden`, `organization.*`, `side_menu.options.*`, ro + en.
  - Browser check: empty submit → every field required (+ statute); .txt as statute refused; duplicate phone → ORG_004 message, Turnstile reset; then success → mailcatcher "Activează Asociatia Test W3" → `/confirm-email` → session → dashboard with banner, no Validation menu, `/admin/validation` → 403. Team: Add admin (irina@w3.test) → toast "Invitație trimisă la i•••@w3.test", "expiră în 14 zile", last invite by Tudor; Disable → Dezactivat; Enable (only option shown) → Invitație expirată (Disable ended the invite; Send invite gives a new one, R20). `auth:super-admin -- tudor@w3.test` → Validation menu + row with logo, statute, first admin → Validate → toast, list empty, banner gone. Edit: website + new statute → saved, profile shows them.
  - Local test data: NGO "Asociatia Test W3" (admin tudor@w3.test, password `Vic-Local-Test1!`, now super admin; colleague irina@w3.test without password).
  - Not done: Suspend clicked only through the API in Layer 9; `lastLoginAt` stays empty after a session started by confirm-email or set-password (backend only sets it on login, worth a look).

- 2026-11-06: `lastLoginAt` fixed. It is now set in `AuthIdentityFacade.createSession` (same transaction), so every new session counts: password, social, mobile code reset, and the web set-password / confirm-email links. `registerSuccessfulLogin` only resets the lockout. Covered by `auth-identity.facade.spec.ts` and e2e assertions in `auth-web` (set-password) and `organization-registration` (confirm-email). Refresh rotations do not touch it.
- 2026-11-06, local web regression (R34) as ana.admin@seed.test on `vic`, with data made through the real flows (no NGO had any before):
  - Access codes: "Creează cod nou" → SEED2026, created by Ana Admin; Elena joins with it (mobile API) → active volunteer, usage 1.
  - Access requests: Florin and Gabriela request (mobile API) → listed → approved from the row menu → Volunteers lists them.
  - Activity log: Elena logs hours (after her volunteer profile) → "3 ore în curs de aprobare" → approved from the activity sheet.
  - Contracts and Templates tabs load (no contract generated: that needs a template PDF and signing in the app).
  - Found: approving a request or hours answered 500 when the volunteer has no notification settings (`requestedBy.notificationsSettings.notificationsViaPush` on null). Pre-existing on main: the July 2023 migration linking users to notifications_settings never backfilled. Only the seeded users lacked them; app-created users have them. Added pre-flight query 7 (count of such volunteers; expect 0, else backfill before the cutover) and settings for the seeded volunteers in `auth-local-seed.sql` (idempotent). Re-tested: both approvals succeed, no 4xx/5xx in the log.
  - Business rules met on the way (unchanged, not auth): USER_005 identity data before joining, USER_004 duplicate ID number, two answers per request, ACTIVITY_LOG_002 volunteer profile before logging hours.
- 2026-11-09, Suspend through the web UI (local, as ana.admin@seed.test): Bogdan given a password through forgot-password (mailcatcher) and a live web session (curl). Team → row menu → Dezactivează → confirm dialog → toast, status "Dezactivat", last login shows his session from a minute earlier (the 11-06 lastLoginAt fix, seen in the UI). His refresh cookie → 401 AUTH_008; login → 403 AUTH_004. Activează → dialog (no email sent, none in mailcatcher) → login works again. Gotcha: the local backend `.env` allows CORS only for `http://localhost:5173`; `npm start` runs vite on 3000 and every call fails as "Autentificarea nu a reușit". Run `npx vite --port 5173`.
