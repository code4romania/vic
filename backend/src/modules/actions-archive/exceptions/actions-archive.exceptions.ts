import { BusinessException } from 'src/common/interfaces/business-exception.interface';

enum ActionArchiveExceptionCodes {
  TRACK_ACTION_ARCHIVE_001 = 'TRACK_ACTION_ARCHIVE_001',
}

type ActionArchiveExceptionCodeType = keyof typeof ActionArchiveExceptionCodes;

export const ActivityLogExceptionMessages: Record<
  ActionArchiveExceptionCodes,
  BusinessException<ActionArchiveExceptionCodeType>
> = {
  [ActionArchiveExceptionCodes.TRACK_ACTION_ARCHIVE_001]: {
    code_error: ActionArchiveExceptionCodes.TRACK_ACTION_ARCHIVE_001,
    message: 'Error while tracking action',
  },
};
