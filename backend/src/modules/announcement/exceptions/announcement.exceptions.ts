import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum AnnouncementExceptionCodes {
  ANNOUNCEMENT_001 = 'ANNOUNCEMENT_001',
  ANNOUNCEMENT_002 = 'ANNOUNCEMENT_002',
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
    message: 'A published announcement cannot be modified',
  },
};
