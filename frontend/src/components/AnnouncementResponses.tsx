import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { formatDateWithTime } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import { IAnnouncementResponse } from '../services/announcement/announcement.api';
import { useAnnouncementResponses } from '../services/announcement/announcement.service';
import AnnouncementPager from './AnnouncementPager';
import InitialsAvatar from './InitialsAvatar';
import LoadingContent from './LoadingContent';

const PAGE_SIZE = 10;

// One volunteer's answer: who, how to reach them, what they wrote and when.
const ResponseItem = ({ response }: { response: IAnnouncementResponse }) => (
  <li className="rounded-xl border border-cool-gray-200 p-4 sm:p-5 flex gap-3 sm:gap-4">
    <InitialsAvatar name={response.user.name} />
    <div className="min-w-0 flex-1 flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {response.volunteerId ? (
            <Link
              className="font-robotoMedium text-cool-gray-900 hover:underline break-words"
              to={`/volunteers/${response.volunteerId}`}
            >
              {response.user.name}
            </Link>
          ) : (
            <p className="font-robotoMedium text-cool-gray-900 break-words">{response.user.name}</p>
          )}
          <p className="text-sm text-cool-gray-500 break-all">{response.user.email}</p>
        </div>
        <a className="btn-outline-secondary" href={`mailto:${response.user.email}`}>
          <EnvelopeIcon className="w-4 h-4" aria-hidden="true" />
          {i18n.t('announcement:detail.contact')}
        </a>
      </div>
      {response.comment && (
        <p className="rounded-lg bg-cool-gray-50 border border-cool-gray-100 px-3 py-2 text-sm text-cool-gray-800 whitespace-pre-line break-words">
          {response.comment}
        </p>
      )}
      <small className="text-cool-gray-500">{formatDateWithTime(response.createdOn)}</small>
    </div>
  </li>
);

// VIC 2.0 (#504): what volunteers answered from the app, newest first
const AnnouncementResponses = ({ announcementId }: { announcementId: string }) => {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useAnnouncementResponses(announcementId, page, PAGE_SIZE);
  const total = data?.meta?.totalItems ?? 0;
  const pages = data?.meta?.totalPages ?? 0;

  return (
    <Card>
      <div className="px-5 sm:px-6 py-4">
        <h2>{i18n.t('announcement:detail.responses_title')}</h2>
        <p className="text-sm text-cool-gray-500">
          {total > 0
            ? i18n.t('announcement:responses.title', { count: total })
            : i18n.t('announcement:detail.responses_subtitle')}
        </p>
      </div>
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        {isLoading && <LoadingContent />}
        {!isLoading && total === 0 && (
          <p className="py-6 text-center text-cool-gray-500">
            {i18n.t('announcement:detail.no_responses')}
          </p>
        )}
        {total > 0 && (
          <ul className="flex flex-col gap-3">
            {data?.items.map((response) => <ResponseItem key={response.id} response={response} />)}
          </ul>
        )}
        {pages > 1 && <AnnouncementPager page={page} pages={pages} onChange={setPage} />}
      </div>
    </Card>
  );
};

export default AnnouncementResponses;
