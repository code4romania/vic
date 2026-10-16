# W3 · Web: NGO registration, validation banner, super admin review, Team, full organization edit

Status: needs-info
Type: task
Blocked by: 12
Tracker card: W3

Outline until Layer 7.

- `/register` (`RegisterOrganization.tsx`): organization card + first-admin card; build a county select on `getCounties()` (`src/services/location/location.api.ts`), wire `LocationSelect` into a `Controller` with a county filter; `FileUpload` for the logo (`image`) and the statute (`doc`, PDF only, size shown); Turnstile widget; multipart `POST /organizations/register` as in `src/services/event/event.api.ts`; 409 / 400 messages; success screen with the masked email.
- Validation banner on every private page while `organization.validatedAt` is null.
- `/admin/validation` (`OrganizationValidation.tsx`): `DataTableComponent`, Validate / Suspend with `ConfirmationModal`; menu entry only when `isSuperAdmin`; 403 page for plain admins.
- `/organization/team` (`Team.tsx`): table with status badge, last login, last invite; Send invite (pending statuses only), Disable / Enable (not on yourself); Add admin `Modal`.
- Menu: `roles?` on `IRoute` in `src/common/constants/routes.ts`, one `useVisibleRoutes()` hook used by `SideMenu.tsx` and `SlidingMenu.tsx`.
- `EditOrganization.tsx`: every field, logo and statute replacement; `organization.api.ts` `updateOrganization(data, files?)` multipart; `IOrganization` + status, validatedAt, taxId, website, statuteUrl.
- Translations `register_organization`, `validation`, `team`.

## Comments
