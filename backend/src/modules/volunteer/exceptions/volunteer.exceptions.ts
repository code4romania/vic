import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum VolunteerExceptionCodes {
  VOLUNTEER_001 = 'VOLUNTEER_001',
  VOLUNTEER_002 = 'VOLUNTEER_002',
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
      'The user already is part of the organization (no matter the status).',
  },
};
