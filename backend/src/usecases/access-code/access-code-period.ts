import { isBefore, startOfDay } from 'date-fns';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AccessCodeExceptionMessages } from 'src/modules/organization/exceptions/access-codes.exceptions';

// #593: an access code cannot end before the day it starts (an open end is fine).
export function assertAccessCodePeriod(
  startDate: Date,
  endDate: Date | null | undefined,
  exceptionService: ExceptionsService,
): void {
  if (
    endDate &&
    isBefore(startOfDay(new Date(endDate)), startOfDay(new Date(startDate)))
  ) {
    exceptionService.badRequestException(
      AccessCodeExceptionMessages.ACCESS_CODE_003,
    );
  }
}
