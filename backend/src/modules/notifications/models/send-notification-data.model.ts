/* eslint-disable @typescript-eslint/no-explicit-any */
import { Language } from 'src/modules/user/enums/user.enum';

// A text in every language: each phone gets the one of its user (Romanian when they have none yet).
export type PushText = string | Record<Language, string>;

export interface SendNotificationData {
  userIds: string[];
  title: PushText;
  body: PushText;
  data?: any;
}
