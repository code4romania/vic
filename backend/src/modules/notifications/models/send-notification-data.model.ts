/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SendNotificationData {
  userIds: string[];
  title: string;
  body: string;
  data?: any;
}
