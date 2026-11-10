import { BadRequestException } from '@nestjs/common';
import { bucharestDay } from 'src/common/helpers/bucharest-time';
import { DateUtils } from 'typeorm/util/DateUtils';
import { EntityManager } from 'typeorm';
import { ActivityLogExceptionMessages } from './exceptions/activity-log.exceptions';

export const MAX_HOURS_PER_DAY = 24;

export interface ActivityLogRuleInput {
  volunteerId: string;
  date: Date | string;
  hours: number;
  eventId?: string | null;
  activityTypeId?: string | null;
  // the log being edited, left out of the totals and the duplicate check
  excludeId?: string;
}

// M12: the rules every logged activity follows, whoever logs it (admin or volunteer) and on edit.
// The DTOs already refuse non-integer hours and more than 24 at once; this checks what needs the
// database. 400 ACTIVITY_LOG_007..010. Rejected hours do not count.
export async function assertActivityLogAllowed(
  manager: EntityManager,
  input: ActivityLogRuleInput,
): Promise<void> {
  const date = new Date(input.date);
  if (bucharestDay(date) > bucharestDay(new Date())) {
    throw new BadRequestException(
      ActivityLogExceptionMessages.ACTIVITY_LOG_007,
    );
  }

  if (input.eventId) {
    const [event] = await manager.query(
      `SELECT status FROM event WHERE id = $1`,
      [input.eventId],
    );
    if (event?.status === 'draft') {
      throw new BadRequestException(
        ActivityLogExceptionMessages.ACTIVITY_LOG_010,
      );
    }
  }

  // the day as the date column stores it
  const day = DateUtils.mixedDateToDateString(date);
  const [row] = await manager.query(
    `SELECT COALESCE(SUM(hours), 0) AS total,
            bool_or(event_id IS NOT DISTINCT FROM $3::uuid
                    AND activity_type_id IS NOT DISTINCT FROM $4::uuid) AS duplicate
       FROM activity_log
      WHERE volunteer_id = $1 AND date = $2::date AND status <> 'rejected'
        AND deleted_on IS NULL AND ($5::uuid IS NULL OR id <> $5::uuid)`,
    [
      input.volunteerId,
      day,
      input.eventId ?? null,
      input.activityTypeId ?? null,
      input.excludeId ?? null,
    ],
  );
  if (row?.duplicate) {
    throw new BadRequestException(
      ActivityLogExceptionMessages.ACTIVITY_LOG_009,
    );
  }
  if (+row.total + +input.hours > MAX_HOURS_PER_DAY) {
    throw new BadRequestException(
      ActivityLogExceptionMessages.ACTIVITY_LOG_008,
    );
  }
}
