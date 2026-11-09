import React from 'react';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { IVolunteerEvent } from '../common/interfaces/volunteer-events.interface';
import { formatDate } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import { useVolunteerEventsQuery } from '../services/volunteer/volunteer.service';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';

const period = (event: IVolunteerEvent) =>
  event.endDate && formatDate(event.endDate) !== formatDate(event.startDate)
    ? `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`
    : formatDate(event.startDate);

const EventList = ({
  title,
  events,
  showHours,
}: {
  title: string;
  events: IVolunteerEvent[];
  showHours?: boolean;
}) => (
  <section className="flex flex-col gap-3" aria-label={title}>
    <h3>{`${title} (${events.length})`}</h3>
    {events.length === 0 ? (
      <p className="text-cool-gray-500">{i18n.t('volunteer:events.none')}</p>
    ) : (
      <ul className="flex flex-col divide-y divide-cool-gray-200">
        {events.map((event) => (
          <li key={event.id} className="flex flex-wrap justify-between gap-2 py-3">
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-robotoBold truncate">{event.name}</p>
              <small className="flex items-center gap-1 text-cool-gray-500">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                {period(event)}
              </small>
              {event.location && (
                <small className="flex items-center gap-1 text-cool-gray-500">
                  <MapPinIcon className="w-4 h-4 shrink-0" />
                  {event.location}
                </small>
              )}
            </div>
            {showHours && (
              <small className="text-cool-gray-700 self-center">
                {i18n.t('volunteer:events.hours', { hours: event.hours })}
              </small>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

// #485: the events the volunteer takes part in, read only
const VolunteerEvents = ({ volunteerId }: { volunteerId: string }) => {
  const { data, isLoading, error } = useVolunteerEventsQuery(volunteerId);

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('volunteer:events.title')}</h2>
      </CardHeader>
      <CardBody>
        {isLoading && <LoadingContent />}
        {error && <EmptyContent description={i18n.t('general:error.load_entries')} />}
        {data && (
          <div className="flex flex-col gap-8">
            <EventList title={i18n.t('volunteer:events.upcoming')} events={data.upcoming} />
            <EventList
              title={i18n.t('volunteer:events.finished')}
              events={data.finished}
              showHours
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default VolunteerEvents;
