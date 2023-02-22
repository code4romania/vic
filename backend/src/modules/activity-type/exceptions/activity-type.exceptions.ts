import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum ActivityTypeExceptionCodes {
  ACTIVITY_TYPE_001 = 'ACTIVITY_TYPE_001',
  ACTIVITY_TYPE_002 = 'ACTIVITY_TYPE_002',
  ACTIVITY_TYPE_003 = 'ACTIVITY_TYPE_003',
  ACTIVITY_TYPE_004 = 'ACTIVITY_TYPE_004',
}

type ActivityTypeExceptionCodeType = keyof typeof ActivityTypeExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const ActivityTypeExceptionMessages: Record<
  ActivityTypeExceptionCodes,
  BusinessException<ActivityTypeExceptionCodeType>
> = {
  [ActivityTypeExceptionCodes.ACTIVITY_TYPE_001]: {
    code_error: ActivityTypeExceptionCodes.ACTIVITY_TYPE_001,
    message: 'Activity Type not found.',
  },
  [ActivityTypeExceptionCodes.ACTIVITY_TYPE_002]: {
    code_error: ActivityTypeExceptionCodes.ACTIVITY_TYPE_002,
    message:
      'Another "Activity Type" with the same name already exists in the organization.',
  },
  [ActivityTypeExceptionCodes.ACTIVITY_TYPE_003]: {
    code_error: ActivityTypeExceptionCodes.ACTIVITY_TYPE_003,
    message: 'The "Activity Type" is already in ARCHIVED/ACTIVE state.',
  },
  [ActivityTypeExceptionCodes.ACTIVITY_TYPE_004]: {
    code_error: ActivityTypeExceptionCodes.ACTIVITY_TYPE_004,
    message:
      'Could not create Activity Type. One of the Branch/Department/Role is wrong or does not exist.',
  },
};
