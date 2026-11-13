import { TrackedEventName } from './action-resource-types.enum';

export enum NewsType {
  LOGGED_HOURS = 'LOGGED_HOURS',
  CONTRACTS = 'CONTRACTS',
  ORGANIZATIONS = 'ORGANIZATIONS',
}

// The tracked events the mobile "Noutăți" shows, by tab.
export const NEWS_EVENTS: Record<NewsType, TrackedEventName[]> = {
  [NewsType.ORGANIZATIONS]: [
    TrackedEventName.APPROVE_ACCESS_REQUEST,
    TrackedEventName.REJECT_ACCESS_REQUEST,
  ],
  [NewsType.CONTRACTS]: [
    TrackedEventName.CREATE_CONTRACT,
    TrackedEventName.APPROVE_CONTRACT,
    TrackedEventName.REJECT_CONTRACT,
  ],
  [NewsType.LOGGED_HOURS]: [TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS],
};

// Every event of every tab: what the unread count on the Home bell counts.
export const ALL_NEWS_EVENTS: TrackedEventName[] =
  Object.values(NEWS_EVENTS).flat();
