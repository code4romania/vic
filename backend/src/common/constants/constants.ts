export type QUEUES_TYPES =
  | 'MAILS'
  | 'PUSH_NOTIFICATIONS_TICKETS'
  | 'AUTH_TRANSITION'
  | 'AUTH_MAINTENANCE'; // Union type

export const QUEUES: Record<QUEUES_TYPES, string> = {
  MAILS: 'mails-vic',
  PUSH_NOTIFICATIONS_TICKETS: 'push-notifications-tickets-vic',
  // Transition emails from auth:migrate, held (paused) until `announce --release-transition`.
  AUTH_TRANSITION: 'auth-transition-vic',
  // The daily auth cleanup job.
  AUTH_MAINTENANCE: 'auth-maintenance-vic',
};

// Jobs that carry secrets (login links and codes in emails) or personal data are not kept in Redis once done:
// a completed job is removed at once, a failed one is kept at most a day (100 at most) to look into.
export const SENSITIVE_JOB_OPTIONS = {
  removeOnComplete: true,
  removeOnFail: { age: 24 * 60 * 60, count: 100 },
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
  ORGANIZATIONS: 'organizations', // organizations/<id>/: logo (public bucket)
};
