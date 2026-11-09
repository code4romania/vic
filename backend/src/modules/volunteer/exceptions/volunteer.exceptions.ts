import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum VolunteerExceptionCodes {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
  VOLUNTEER_003 = 'VOLUNTEER_003',
  VOLUNTEER_004 = 'VOLUNTEER_004',
  VOLUNTEER_005 = 'VOLUNTEER_005',
  VOLUNTEER_006 = 'VOLUNTEER_006',
  VOLUNTEER_007 = 'VOLUNTEER_007',
  VOLUNTEER_008 = 'VOLUNTEER_008',
  VOLUNTEER_009 = 'VOLUNTEER_009',

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
    message: 'Only ACTIVE volunteers can be made inactive.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_004]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_004,
    message: 'Only INACTIVE volunteers can be activated.',
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
  [VolunteerExceptionCodes.VOLUNTEER_005]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_005,
    message: 'The user does not have a volunteer profile on this organization',
  },
  [VolunteerExceptionCodes.VOLUNTEER_006]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_006,
    message: 'A blocked volunteer cannot change status.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_007]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_007,
    message:
      'The volunteer is not active: hours, documents and contracts are read-only.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_008]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_008,
    message:
      'The organization made this volunteer inactive; only the organization can activate them.',
  },
  [VolunteerExceptionCodes.VOLUNTEER_009]: {
    code_error: VolunteerExceptionCodes.VOLUNTEER_009,
    message: 'A volunteer with this email already exists in the organization.',
  },
};
