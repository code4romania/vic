import { BadRequestException } from '@nestjs/common';
import {
  EDITABLE_VOLUNTEER_STATUSES,
  VolunteerStatus,
} from './enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from './exceptions/volunteer.exceptions';

// Inactive, Blocked and Candidate volunteers keep their hours, documents and contracts
// as they are: nothing about them can change any more (VIC 2.0, issue #472).
export function assertVolunteerEditable(
  volunteer: { status?: VolunteerStatus } | null | undefined,
): void {
  if (
    volunteer?.status &&
    !EDITABLE_VOLUNTEER_STATUSES.includes(volunteer.status)
  ) {
    throw new BadRequestException(VolunteerExceptionMessages.VOLUNTEER_007);
  }
}

// Blocked is permanent: no status change is allowed out of it.
export function assertVolunteerNotBlocked(
  volunteer: { status?: VolunteerStatus } | null | undefined,
): void {
  if (volunteer?.status === VolunteerStatus.BLOCKED) {
    throw new BadRequestException(VolunteerExceptionMessages.VOLUNTEER_006);
  }
}
