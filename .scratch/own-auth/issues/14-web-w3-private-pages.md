# W3 · Web: NGO registration, validation banner, super admin review, Team, full organization edit

Status: needs-info
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
