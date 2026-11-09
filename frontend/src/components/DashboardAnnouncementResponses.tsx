import React from 'react';
import { useNavigate } from 'react-router';
import i18n from '../common/config/i18n';
import { formatDateWithTime } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import { useDashboardAnnouncementResponsesQuery } from '../services/dashboard/dashboard.service';
import Button from './Button';
import CardBody from './CardBody';
import CardHeader from './CardHeader';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`dashboard:announcement_responses.${key}`, options)}`;

// VIC 2.0, #467: the latest 3 responses volunteers left on the organization's announcements.
const DashboardAnnouncementResponses = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboardAnnouncementResponsesQuery();

  return (
    <Card>
      <CardHeader>
        <h2>{t('title')}</h2>
        <Button
          label={`${i18n.t('dashboard:see_all')}`}
          className="btn-outline-secondary"
          onClick={() => navigate('/announcements')}
        />
      </CardHeader>
      <CardBody>
        {!isLoading && !data?.length && <p className="text-cool-gray-500">{t('empty')}</p>}
        <ul className="flex flex-col divide-y divide-cool-gray-200">
          {data?.map((response) => (
            <li key={response.id} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1">
              <span className="flex flex-wrap justify-between gap-x-3 text-sm">
                <span className="font-medium">{response.volunteerName}</span>
                <span className="text-cool-gray-500">{formatDateWithTime(response.createdOn)}</span>
              </span>
              <p className="text-cool-gray-800 break-words">{response.comment}</p>
              <button
                type="button"
                className="self-start text-sm text-cool-gray-500 hover:text-yellow-600 text-left"
                onClick={() => navigate(`/announcements/${response.announcementId}`)}
              >
                {t('on', { name: response.announcementName })}
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

export default DashboardAnnouncementResponses;
