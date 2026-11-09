import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AnnouncementExceptionCodes {
  ANNOUNCEMENT_001 = 'ANNOUNCEMENT_001',
  ANNOUNCEMENT_002 = 'ANNOUNCEMENT_002',
  ANNOUNCEMENT_003 = 'ANNOUNCEMENT_003',
  ANNOUNCEMENT_004 = 'ANNOUNCEMENT_004',
  ANNOUNCEMENT_005 = 'ANNOUNCEMENT_005',
  ANNOUNCEMENT_006 = 'ANNOUNCEMENT_006',
  ANNOUNCEMENT_007 = 'ANNOUNCEMENT_007',
}

type AnnouncementExceptionCodeType = keyof typeof AnnouncementExceptionCodes;

export const AnnouncementExceptionMessages: Record<
  AnnouncementExceptionCodes,
  BusinessException<AnnouncementExceptionCodeType>
> = {
  [AnnouncementExceptionCodes.ANNOUNCEMENT_001]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_001,
    message: 'Announcement not found',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_002]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_002,
    message: 'An archived announcement cannot be modified',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_003]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_003,
    message: 'Only departments can be chosen',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_004]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_004,
    message: 'Error while sending the anouncement notifications',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_005]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_005,
    message: 'The display period must end after it starts',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_006]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_006,
    message:
      'Only active volunteers of the organization can answer an active announcement',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_007]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_007,
    message: 'You already answered this announcement',
  },
};
