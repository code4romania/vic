import React from 'react';
import i18n from '../common/config/i18n';
import { useVolunteerStatsQuery } from '../services/volunteer/volunteer.service';

// #480: total approved hours and number of events, under the volunteer's picture
const VolunteerStats = ({ volunteerId }: { volunteerId: string }) => {
  const { data: stats } = useVolunteerStatsQuery(volunteerId);

  const counters = [
    { key: 'hours', label: i18n.t('volunteer:stats.hours'), value: stats?.totalHours },
    { key: 'events', label: i18n.t('volunteer:stats.events'), value: stats?.events },
  ];

  return (
    <dl className="flex flex-col gap-2 w-full">
      {counters.map((counter) => (
        <div
          key={counter.key}
          className="flex items-center justify-between gap-3 rounded-lg bg-cool-gray-50 px-3 py-2"
        >
          <dt className="text-cool-gray-500 text-sm">{counter.label}</dt>
          <dd className="font-robotoBold text-cool-gray-800 text-xl" aria-label={counter.label}>
            {counter.value ?? '-'}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default VolunteerStats;
