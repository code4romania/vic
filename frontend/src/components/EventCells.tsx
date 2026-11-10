import React from 'react';
import { isSameDay } from 'date-fns';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { EventDisplayStatus } from '../common/enums/event-status';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { IEvent } from '../common/interfaces/event.interface';
import { useEventRegistrationsQuery } from '../services/event/event.service';
import StatusBadge, { BadgeTone } from './StatusBadge';

// Pieces of the events list and the event page (VIC 2.0 redesign): period, place, departments,
// participants, status and pending registrations.

const locale = () => (i18n.language?.startsWith('en') ? 'en-GB' : 'ro-RO');

// "15 nov. 2026"
export const formatEventDay = (value: Date | string): string =>
  new Date(value).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });

// "21:20"
export const formatEventTime = (value: Date | string): string =>
  new Date(value).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });

// the end, in short: only the hour when the event ends on the day it starts
export const formatEventEnd = (startDate: Date | string, endDate: Date | string): string =>
  isSameDay(new Date(startDate), new Date(endDate))
    ? formatEventTime(endDate)
    : `${formatEventDay(endDate)}, ${formatEventTime(endDate)}`;

export const EventPeriod = ({ event }: { event: Pick<IEvent, 'startDate' | 'endDate'> }) => (
  <div className="flex items-start gap-2 text-sm text-cool-gray-900">
    <CalendarIcon className="w-4 h-4 mt-0.5 shrink-0 text-cool-gray-500" aria-hidden="true" />
    <div className="flex flex-col">
      <span className="text-sm">{`${formatEventDay(event.startDate)}, ${formatEventTime(
        event.startDate,
      )}`}</span>
      {event.endDate && (
        <span className="text-xs text-cool-gray-500">
          {i18n.t('events:table.until', { date: formatEventEnd(event.startDate, event.endDate) })}
        </span>
      )}
    </div>
  </div>
);

export const EventLocation = ({ location }: { location?: string | null }) =>
  location ? (
    <div className="flex items-start gap-2 text-sm text-cool-gray-900">
      <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0 text-cool-gray-500" aria-hidden="true" />
      <span className="text-sm">{location}</span>
    </div>
  ) : (
    <span className="text-cool-gray-400">–</span>
  );

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex rounded-md border border-cool-gray-300 bg-white px-1.5 py-0.5 text-xs text-cool-gray-700 whitespace-nowrap">
    {children}
  </span>
);

// who the event is for: public, the whole organization, or some departments
export const EventTargets = ({ event }: { event: Pick<IEvent, 'isPublic' | 'targets'> }) => (
  <div className="flex flex-wrap gap-1">
    {event.isPublic ? (
      <Chip>{i18n.t('events:table.public')}</Chip>
    ) : !event.targets?.length ? (
      <Chip>{i18n.t('events:table.all')}</Chip>
    ) : (
      event.targets.map((target) => <Chip key={target.id}>{target.name}</Chip>)
    )}
  </div>
);

// registered (approved, going) out of the capacity, with a bar when there is a limit
export const EventParticipants = ({
  going,
  capacity,
  notGoing,
}: {
  going?: number;
  capacity?: number | null;
  notGoing?: number;
}) => {
  const count = going ?? 0;
  const percent = capacity ? Math.min(100, Math.round((count / capacity) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-[6rem]">
      <span className="flex items-center gap-1.5 text-sm text-cool-gray-900">
        <UsersIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
        <span className="text-sm font-robotoMedium">
          {capacity ? `${count} / ${capacity}` : count}
        </span>
      </span>
      {!!capacity && (
        <div
          className="h-1.5 w-full rounded-full bg-cool-gray-200 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={capacity}
          aria-valuenow={count}
          aria-label={`${i18n.t('events:detail.capacity_value', { going: count, capacity })}`}
        >
          <div className="h-full rounded-full bg-figure-green" style={{ width: `${percent}%` }} />
        </div>
      )}
      {!!notGoing && (
        <span className="text-xs text-cool-gray-500">
          {i18n.t('events:table.not_going', { count: notGoing })}
        </span>
      )}
    </div>
  );
};

const STATUS_TONE: Record<string, BadgeTone> = {
  [EventDisplayStatus.PUBLISHED]: 'green',
  [EventDisplayStatus.DRAFT]: 'amber',
  [EventDisplayStatus.FINISHED]: 'gray',
  [EventDisplayStatus.ARCHIVED]: 'red',
};

export const EventStatusBadge = ({
  event,
}: {
  event: Pick<IEvent, 'status' | 'displayStatus'>;
}) => {
  const status = event.displayStatus || event.status;
  return (
    <StatusBadge tone={STATUS_TONE[status] ?? 'gray'}>
      {i18n.t(`events:display_status.${status}`)}
    </StatusBadge>
  );
};

// how many registrations wait for the NGO's decision (#501); nothing when none
export const EventPendingBadge = ({ eventId }: { eventId: string }) => {
  const { data } = useEventRegistrationsQuery({
    status: EventRegistrationStatus.PENDING,
    page: 1,
    limit: 1,
    eventId,
  });
  const count = data?.meta?.totalItems ?? 0;
  if (!count) return null;
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-robotoMedium whitespace-nowrap text-figure-amber ring-1 ring-inset ring-figure-amber">
      {i18n.t('events:table.pending', { count })}
    </span>
  );
};
