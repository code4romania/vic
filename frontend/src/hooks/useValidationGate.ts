import i18n from '../common/config/i18n';
import { useOrganizationQuery } from '../services/organization/organization.service';

export interface ValidationGate {
  // The organization is known to wait for the super admin's validation
  blocked: boolean;
  // Props for a button that needs a validated organization: disabled, with the reason as tooltip
  gate: { disabled?: boolean; title?: string };
}

// Decision 1: until VIC validates the NGO, the API answers ORG_005 to actions that bring people
// in or send emails (add/import volunteers, access requests and codes, events, announcements, hours). The web
// disables those buttons up front, reading the same organization the global banner reads. While
// the organization loads nothing is blocked: the API still refuses.
export const useValidationGate = (): ValidationGate => {
  const { data: organization } = useOrganizationQuery();
  const blocked = !!organization && !organization.validatedAt;
  return {
    blocked,
    gate: blocked ? { disabled: true, title: i18n.t('organization:validation_required') } : {},
  };
};
