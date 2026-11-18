import { ACTION_TEXTS, STATUS_TEXTS } from './actions-archive.texts.ro';

type EventData = Record<string, unknown> & {
  changes?: { name?: { original?: string; updated?: string } };
};

// Which status names a status-change action uses (the web does the same in actions-archive.mappings.tsx).
const STATUS_KIND: Record<string, keyof typeof STATUS_TEXTS> = {
  CHANGE_VOLUNTEER_STATUS: 'volunteer',
  CHANGE_ACTIVITY_TYPE_STATUS: 'activityType',
  CHANGE_EVENT_STATUS: 'event',
  CHANGE_ANNOUNCEMENT_STATUS: 'announcement',
};

const STRUCTURE_EVENTS = [
  'CREATE_ORGANIZATION_STRUCTURE',
  'UPDATE_ORGANIZATION_STRUCTURE',
  'DELETE_ORGANIZATION_STRUCTURE',
];

// An action of the history as the web writes it: its Romanian name and its sentence (#683). An action
// this list does not know keeps its code and its data as JSON, so the backup never loses anything.
export function describeAction(
  eventName: string,
  eventData: EventData | null,
): { label: string; text: string } {
  const texts = ACTION_TEXTS[eventName];
  const data: EventData = eventData ?? {};
  if (!texts) {
    return {
      label: eventName,
      text: eventData ? JSON.stringify(eventData) : '',
    };
  }

  const variant = STRUCTURE_EVENTS.includes(eventName)
    ? String(data.organizationStructureType)
    : eventName === 'CHANGE_ACTIVITY_LOG_STATUS'
      ? String(data.newStatus)
      : 'description';
  const template = texts[variant] ?? texts.description;
  if (!template) {
    return { label: texts.label, text: JSON.stringify(data) };
  }

  const values: Record<string, unknown> = { ...data };
  const kind = STATUS_KIND[eventName];
  if (kind) {
    const names = STATUS_TEXTS[kind];
    values.oldStatus = names[String(data.oldStatus)] ?? data.oldStatus;
    values.newStatus = names[String(data.newStatus)] ?? data.newStatus;
  }
  if (eventName === 'UPDATE_ORGANIZATION_STRUCTURE') {
    values.organizationStructureNameInitial = data.changes?.name?.original;
    values.organizationStructureNameFinal = data.changes?.name?.updated;
  }

  const text = template
    .replace(/<\/?inlineLink>/g, '')
    .replace(/{{(\w+)}}/g, (_, key: string) =>
      values[key] === undefined || values[key] === null
        ? ''
        : String(values[key]),
    );
  return { label: texts.label, text };
}
