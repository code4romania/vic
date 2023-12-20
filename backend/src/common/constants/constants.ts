export type QUEUES_TYPES = 'MAILS' | 'PUSH_NOTIFICATIONS_TICKETS'; // Union type

export const QUEUES: Record<QUEUES_TYPES, string> = {
  MAILS: 'mails-vic',
  PUSH_NOTIFICATIONS_TICKETS: 'push-notifications-tickets-vic',
};

export const DATE_CONSTANTS = {
  YYYY_MM_DD_HH_SS: 'yyyy-MM-dd HH:MM:SS',
  YYYY_MM_DD: 'yyyy-MM-dd',
};

export const S3_FILE_PATHS = {
  TEMPLATES: 'templates',
  CONTRACTS: 'contracts',
  PROFILE: 'profile',
  EVENTS: 'events',
};
