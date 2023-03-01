import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum VolunteerExceptionCodes {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
  VOLUNTEER_003 = 'VOLUNTEER_003',
  VOLUNTEER_004 = 'VOLUNTEER_004',

  // Profile
  VOLUNTEER_PROFILE_001 = 'VOLUNTEER_PROFILE_001',
  VOLUNTEER_PROFILE_002 = 'VOLUNTEER_PROFILE_002',
  VOLUNTEER_PROFILE_003 = 'VOLUNTEER_PROFILE_003',
}

type VolunteerExceptionCodeType = keyof typeof VolunteerExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const VolunteerExceptionMessages: Record<
  VolunteerExceptionCodes,
  BusinessException<VolunteerExceptionCodeType>
> = {
  [VolunteerExceptionCodes.VOLUNTEER_001]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_001,
    message: 'Volunteer not found.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_002]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_002,
    message:
      'The user is already part of the organization (no matter the status).',
  },
  [VolunteerExceptionCodes.VOLUNTEER_003]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_003,
    message: 'Only ACTIVE volunteers can be archived',
  },
  [VolunteerExceptionCodes.VOLUNTEER_004]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_004,
    message: 'Only ARCHIVED volunteers can be activated.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_PROFILE_001]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_PROFILE_001,
    message: 'The volunteer already has a profile.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_PROFILE_002]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_PROFILE_002,
    message: 'Wrong branch/department/role.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_PROFILE_003]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_PROFILE_003,
    message:
      'Volunteer does not have a profile to be updated. Create one first.',
  },
};
