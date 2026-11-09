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

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`dashboard:upcoming_events.${key}`, options)}`;

// VIC 2.0, #467: the next 3 published events, with registrations against the capacity.
const DashboardUpcomingEvents = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardUpcomingEventsQuery();

  return (
    <Card>
      <CardHeader>
        <h2>{t('title')}</h2>
        <Button
          label={`${i18n.t('dashboard:see_all')}`}
          className="btn-outline-secondary"
          onClick={() => navigate('/events')}
        />
      </CardHeader>
      <CardBody>
        {!isLoading && !data?.length && <p className="text-cool-gray-500">{t('empty')}</p>}
        <ul className="flex flex-col divide-y divide-cool-gray-200">
          {data?.map((event) => (
            <li key={event.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                className="w-full text-left flex flex-col gap-1 hover:text-yellow-600"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <span className="font-medium">{event.name}</span>
                <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cool-gray-500">
                  <span className="flex items-center gap-1 whitespace-pre-line">
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    {formatEventDate(
                      new Date(event.startDate),
                      event.endDate ? new Date(event.endDate) : undefined,
                    )}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 shrink-0" />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4 shrink-0" />
                    {event.capacity
                      ? t('going_capacity', { going: event.going, capacity: event.capacity })
                      : t('going', { going: event.going })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default DashboardUpcomingEvents;
