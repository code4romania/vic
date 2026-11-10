import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum ActivityLogExceptionCodes {
  ACTIVITY_LOG_001 = 'ACTIVITY_LOG_001',
  ACTIVITY_LOG_002 = 'ACTIVITY_LOG_002',
  ACTIVITY_LOG_003 = 'ACTIVITY_LOG_003',
  ACTIVITY_LOG_004 = 'ACTIVITY_LOG_004',
  ACTIVITY_LOG_005 = 'ACTIVITY_LOG_005',
  ACTIVITY_LOG_006 = 'ACTIVITY_LOG_006',
}

type ActivityTypeExceptionCodeType = keyof typeof ActivityLogExceptionCodes;

export const ActivityLogExceptionMessages: Record<
  ActivityLogExceptionCodes,
  BusinessException<ActivityTypeExceptionCodeType>
> = {
  [ActivityLogExceptionCodes.ACTIVITY_LOG_001]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_001,
    message: 'Activity Log not found',
  },
  [ActivityLogExceptionCodes.ACTIVITY_LOG_002]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_002,
    message: 'Volunteer must have a profile to be able to log hours',
  },
  [ActivityLogExceptionCodes.ACTIVITY_LOG_003]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_003,
    message: 'Could not update APPROVED or REJECTED requests.',
  },
  [ActivityLogExceptionCodes.ACTIVITY_LOG_004]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_004,
    message: 'Could not cancel APPROVED or REJECTED requests.',
  },
  [ActivityLogExceptionCodes.ACTIVITY_LOG_005]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_005,
    message: 'Hours can only be added to an active volunteer',
  },
  [ActivityLogExceptionCodes.ACTIVITY_LOG_006]: {
    code_error: ActivityLogExceptionCodes.ACTIVITY_LOG_006,
    message: 'A reason is required to reject hours',
  },
};
