export type QUEUES_TYPES = 'MAILS' | 'PUSH_NOTIFICATIONS_TICKETS'; // Union type

export const QUEUES: Record<QUEUES_TYPES, string> = {
  MAILS: 'mails-vic',
  PUSH_NOTIFICATIONS_TICKETS: 'push-notifications-tickets-vic',
};

export const DATE_CONSTANTS = {
  YYYY_MM_DD_HH_SS: 'yyyy-MM-dd HH:mm:ss',
  YYYY_MM_DD: 'yyyy-MM-dd',
};

export const S3_FILE_PATHS = {
  TEMPLATES: 'templates',
  CONTRACTS: 'contracts',
  PROFILE: 'profile',
  EVENTS: 'events',
};

/**
 * Password rule for every set-password path (login, reset, invite, registration).
 * Same rule the mobile app enforces (REGEX.COGNITO_PASSWORD) and that Cognito enforced:
 * 8 to 256 characters, upper case, lower case, a digit and a symbol, no leading or trailing whitespace.
 */
export const PASSWORD_REGEX =
  /^(?!\s+)(?!.*\s+$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/;
