import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AnnouncementExceptionCodes {
  ANNOUNCEMENT_001 = 'ANNOUNCEMENT_001',
  ANNOUNCEMENT_002 = 'ANNOUNCEMENT_002',
  ANNOUNCEMENT_003 = 'ANNOUNCEMENT_003',
  ANNOUNCEMENT_004 = 'ANNOUNCEMENT_004',
  ANNOUNCEMENT_005 = 'ANNOUNCEMENT_005',
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
    message: 'Error while creating the announcement',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_003]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_003,
    message: 'Error while updating the announcement',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_004]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_004,
    message: 'Error while deleting the announcement',
  },
  [AnnouncementExceptionCodes.ANNOUNCEMENT_005]: {
    code_error: AnnouncementExceptionCodes.ANNOUNCEMENT_005,
    message: 'A published announcement cannot be modified',
  },
};
