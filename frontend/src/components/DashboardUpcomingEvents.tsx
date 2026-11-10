import React from 'react';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';
import i18n from '../common/config/i18n';
import { formatEventDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import { useDashboardUpcomingEventsQuery } from '../services/dashboard/dashboard.service';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import LoadErrorContent from './LoadErrorContent';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`dashboard:upcoming_events.${key}`, options)}`;

// VIC 2.0, #467: the next 3 published events, with registrations against the capacity.
const DashboardUpcomingEvents = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboardUpcomingEventsQuery();

  return (
    <Card>
      <CardHeader>
        <h2>{t('title')}</h2>
      </CardHeader>
      <CardBody>
        {!!error && <LoadErrorContent onRetry={refetch} />}
        {!isLoading && !error && !data?.length && (
          <p className="text-cool-gray-500">{t('empty')}</p>
        )}
        <ul className="flex flex-col gap-2">
          {data?.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                className="w-full text-left flex gap-3 rounded-lg bg-cool-gray-50 hover:bg-navy-50 px-4 py-3"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white border border-cool-gray-200 text-figure-green flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="font-robotoMedium text-cool-gray-900">{event.name}</span>
                  <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cool-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {/* one line: the hours never split as "17:04-" / "22:04" */}
                      <span className="whitespace-nowrap">
                        {formatEventDate(
                          new Date(event.startDate),
                          event.endDate ? new Date(event.endDate) : undefined,
                        ).replace('-\n', ' - ')}
                      </span>
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {event.capacity
                        ? t('going_capacity', { going: event.going, capacity: event.capacity })
                        : t('going', { going: event.going })}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Button
          label={`${i18n.t('dashboard:see_all')}`}
          className="btn-outline-secondary w-full mt-4"
          onClick={() => navigate('/events')}
        />
      </CardBody>
    </Card>
  );
};

export default DashboardUpcomingEvents;
