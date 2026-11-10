import { OrganizationStatus } from './enums/organization-status.enum';

// Decision 1 (M7): what volunteers may see or join in the app is an organization that is active
// (not pending or suspended) and validated by a super admin. A plain SQL condition on the
// organization alias (no parameters, so it can be added to any query), e.g. for the app's event
// lists: `visibleToVolunteersCondition('organization')`.
export function visibleToVolunteersCondition(alias: string): string {
  return `(${alias}.status = '${OrganizationStatus.ACTIVE}' AND ${alias}.validated_at IS NOT NULL)`;
}
