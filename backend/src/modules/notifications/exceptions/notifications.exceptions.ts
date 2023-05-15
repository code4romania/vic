import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum NotificationsExceptionCodes {
  NOTIFICATIONS_001 = 'NOTIFICATIONS_001',
}

type NotificationsExceptionCodeType = keyof typeof NotificationsExceptionCodes;

// Add messages for the coresponding Internal Exception Code
export const NotificationsExceptionMessages: Record<
  NotificationsExceptionCodes,
  BusinessException<NotificationsExceptionCodeType>
> = {
  [NotificationsExceptionCodes.NOTIFICATIONS_001]: {
    code_error: NotificationsExceptionCodes.NOTIFICATIONS_001,
    message: 'Notifications not found',
  },
};
