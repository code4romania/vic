import React from 'react';
import {
  ArchiveBoxIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { IAnnouncement } from '../common/interfaces/announcement.interface';
import { formatDate } from '../common/utils/utils';
import { useAnnouncementResponses } from '../services/announcement/announcement.service';
import { AnnouncementStatusAction } from '../services/announcement/announcement.api';
import Popover from './Popover';
import StatusBadge, { BadgeTone } from './StatusBadge';

export const ANNOUNCEMENT_STATUS_TONE: Record<AnnouncementStatus, BadgeTone> = {
  [AnnouncementStatus.ACTIVE]: 'green',
  [AnnouncementStatus.INACTIVE]: 'gray',
  [AnnouncementStatus.ARCHIVED]: 'navy',
};

export const formatAnnouncementPeriod = (announcement: IAnnouncement): string =>
  announcement.displayEndDate
    ? `${formatDate(announcement.displayStartDate)} - ${formatDate(announcement.displayEndDate)}`
    : `${i18n.t('announcement:card.from', { date: formatDate(announcement.displayStartDate) })}`;

export const formatVolunteersNeeded = (announcement: IAnnouncement): string =>
  announcement.volunteersNeeded
    ? `${i18n.t('announcement:card.volunteers_needed', { count: announcement.volunteersNeeded })}`
    : `${i18n.t('announcement:card.no_volunteers_needed')}`;

// Gray outline chip: the announcement type.
export const AnnouncementTypeChip = ({ announcement }: { announcement: IAnnouncement }) => (
  <span className="inline-flex items-center rounded-md border border-cool-gray-300 bg-white px-2 py-0.5 text-xs font-robotoMedium text-cool-gray-700 whitespace-nowrap">
    {i18n.t(`announcement:type_short.${announcement.type}`)}
  </span>
);

// The list API has no response count, so each card asks for the first page of its responses.
export const useAnnouncementResponseCount = (id: string): number | undefined => {
  const { data } = useAnnouncementResponses(id, 1, 1);
  return data?.meta?.totalItems;
};

export const responsesLabel = (count: number): string =>
  count > 0
    ? `${i18n.t('announcement:card.responses', { count })}`
    : `${i18n.t('announcement:card.no_responses')}`;

interface AnnouncementCardProps {
  announcement: IAnnouncement;
  onView: (announcement: IAnnouncement) => void;
  onEdit: (announcement: IAnnouncement) => void;
  onDuplicate: (announcement: IAnnouncement) => void;
  onChangeStatus: (announcement: IAnnouncement, action: AnnouncementStatusAction) => void;
  onDelete: (announcement: IAnnouncement) => void;
}

// One announcement in the list: title with status and type, text, details, responses.
const AnnouncementCard = ({
  announcement,
  onView,
  onEdit,
  onDuplicate,
  onChangeStatus,
  onDelete,
}: AnnouncementCardProps) => {
  const responses = useAnnouncementResponseCount(announcement.id);

  const view = {
    label: i18n.t('announcement:actions.view'),
    icon: <EyeIcon className="menu-icon" />,
    onClick: onView,
  };
  const edit = {
    label: i18n.t('announcement:actions.edit'),
    icon: <PencilIcon className="menu-icon" />,
    onClick: onEdit,
  };
  const duplicate = {
    label: i18n.t('announcement:actions.duplicate'),
    icon: <DocumentDuplicateIcon className="menu-icon" />,
    onClick: onDuplicate,
  };
  const activate = {
    label: i18n.t('announcement:actions.activate'),
    icon: <CheckIcon className="menu-icon" />,
    onClick: (row: IAnnouncement) => onChangeStatus(row, 'activate'),
    primary: true,
  };
  const deactivate = {
    label: i18n.t('announcement:actions.deactivate'),
    icon: <PauseIcon className="menu-icon" />,
    onClick: (row: IAnnouncement) => onChangeStatus(row, 'deactivate'),
  };
  const archive = {
    label: i18n.t('announcement:actions.archive'),
    icon: <ArchiveBoxIcon className="menu-icon" />,
    onClick: (row: IAnnouncement) => onChangeStatus(row, 'archive'),
  };
  const remove = {
    label: i18n.t('announcement:actions.delete'),
    icon: <TrashIcon className="menu-icon" />,
    onClick: onDelete,
    alert: true,
  };

  const menuItems = {
    [AnnouncementStatus.ACTIVE]: [view, edit, duplicate, deactivate, archive, remove],
    [AnnouncementStatus.INACTIVE]: [view, edit, duplicate, activate, archive, remove],
    [AnnouncementStatus.ARCHIVED]: [view, duplicate, remove],
  }[announcement.status] ?? [view];

  return (
    <article
      aria-label={announcement.name}
      className="bg-white rounded-xl border border-cool-gray-200 shadow-card"
    >
      <div className="p-5 sm:px-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h3 className="min-w-0 break-words">
              <button
                type="button"
                className="text-left text-lg leading-6 font-robotoMedium text-cool-gray-900 hover:underline"
                onClick={() => onView(announcement)}
              >
                {announcement.name}
              </button>
            </h3>
            <StatusBadge tone={ANNOUNCEMENT_STATUS_TONE[announcement.status]}>
              {i18n.t(`announcement:status.${announcement.status}`)}
            </StatusBadge>
            <AnnouncementTypeChip announcement={announcement} />
          </div>
          <div className="shrink-0 pt-1">
            <Popover<IAnnouncement> row={announcement} items={menuItems} />
          </div>
        </div>
        <p className="text-cool-gray-700 whitespace-pre-line break-words">
          {announcement.description}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-cool-gray-600">
          <li className="flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
            {formatVolunteersNeeded(announcement)}
          </li>
          <li className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
            {formatAnnouncementPeriod(announcement)}
          </li>
          <li className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
            {announcement.publishedOn
              ? i18n.t('announcement:card.published', {
                  date: formatDate(announcement.publishedOn),
                })
              : i18n.t('announcement:card.updated', { date: formatDate(announcement.updatedOn) })}
          </li>
        </ul>
      </div>
      <div className="px-5 sm:px-6 py-3 border-t border-cool-gray-200 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-cool-gray-700">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-cool-gray-500" aria-hidden="true" />
          {responses === undefined ? '…' : responsesLabel(responses)}
        </span>
        <button
          type="button"
          className="btn-outline-secondary"
          onClick={() => onView(announcement)}
        >
          {i18n.t('announcement:card.view_responses')}
        </button>
      </div>
    </article>
  );
};

export default AnnouncementCard;
