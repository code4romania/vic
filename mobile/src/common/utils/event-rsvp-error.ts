import i18n from '../config/i18n';
import { EVENT_ERRORS } from '../errors/entities/event.errors';
import { InternalErrors } from '../errors/internal-errors.class';

const codeOf = (error: any): string | undefined => error?.response?.data?.code_error;

// Only this answer means "complete your volunteer profile first"; every other refusal (finished
// event, full event, blocked volunteer, offline) is told as it is.
export const isProfileIncompleteError = (error: any): boolean =>
  codeOf(error) === EVENT_ERRORS.EVENT_RSVP_005;

// The text of a failed "Particip" / "Nu particip" / "Retrage răspuns".
export const rsvpErrorMessage = (error: any): string => {
  if (!error?.response) {
    return i18n.t('general:error.network');
  }
  return InternalErrors.EVENT_ERRORS.getError(codeOf(error) as EVENT_ERRORS);
};

// The event's organization among the volunteer's: by id (sent by the backend), else by name for
// an older backend.
export const findEventOrganization = <T extends { id: string; name: string }>(
  organizations: T[] | undefined,
  event: { organizationId?: string; organizationName?: string } | undefined,
): T | undefined => {
  if (!organizations || !event) {
    return undefined;
  }
  if (event.organizationId) {
    return organizations.find((organization) => organization.id === event.organizationId);
  }
  return organizations.find((organization) => organization.name === event.organizationName);
};
