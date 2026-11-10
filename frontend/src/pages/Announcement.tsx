import {
  ArchiveBoxIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { formatDate, formatDateWithTime } from '../common/utils/utils';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyContent from '../components/EmptyContent';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAnnouncement,
  useDeleteAnnouncementMutation,
  useChangeAnnouncementStatusMutation,
} from '../services/announcement/announcement.service';
import { AnnouncementStatusAction } from '../services/announcement/announcement.api';
import AnnouncementResponses from '../components/AnnouncementResponses';
import {
  ANNOUNCEMENT_STATUS_TONE,
  AnnouncementTypeChip,
  formatAnnouncementPeriod,
  formatVolunteersNeeded,
} from '../components/AnnouncementCard';

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-sm text-cool-gray-500">{label}</dt>
    <dd className="text-cool-gray-900">{children}</dd>
  </div>
);

const Announcement = () => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  const navigate = useNavigate();

  const { id } = useParams();

  const {
    data: announcement,
    isLoading: isAnnouncementLoading,
    error: announcementError,
    refetch,
  } = useAnnouncement(id as string);

  const { mutateAsync: changeStatus, isLoading: isUpdateAnnouncementLoading } =
    useChangeAnnouncementStatusMutation();

  const { mutateAsync: deleteAnnouncement, isLoading: isDeleteAnnouncementLoading } =
    useDeleteAnnouncementMutation();

  useEffect(() => {
    if (announcementError)
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementError.response?.data.code_error),
      );
  }, [announcementError]);

  const onBackButtonPress = () => {
    navigate('/announcements');
  };

  // stays on the page: the status badge and the actions follow the new status
  const onChangeStatus = (action: AnnouncementStatusAction) => {
    if (announcement) {
      changeStatus(
        { id: announcement.id, action },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t(`announcement:submit.messages.${action}`));
            refetch();
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
            );
          },
        },
      );
    }
  };

  const onEdit = () => {
    navigate(`edit`);
  };

  const onDuplicate = () => {
    if (announcement) navigate('/announcements/add', { state: { duplicateOf: announcement } });
  };

  const onDelete = () => {
    if (announcement) setSelectedIdForDeletion(announcement.id);
  };

  const onDeleteAnnouncement = () => {
    if (selectedIdForDeletion) {
      deleteAnnouncement(selectedIdForDeletion, {
        onSuccess: () => {
          useSuccessToast(i18n.t('announcement:submit.messages.delete'));
          onBackButtonPress();
        },
        onError: (error) => {
          useErrorToast(
            InternalErrors.ANNOUNCEMENT_ERRORS.getError(error.response?.data.code_error),
          );
        },
        onSettled: () => {
          setSelectedIdForDeletion(undefined);
        },
      });
    }
  };

  const isBusy = isUpdateAnnouncementLoading || isDeleteAnnouncementLoading;

  const actions = announcement && (
    <>
      <Button
        className="btn-outline-secondary text-figure-red"
        icon={<TrashIcon className="h-5 w-5" />}
        label={i18n.t('announcement:actions.delete')}
        disabled={isBusy}
        onClick={onDelete}
      />
      <Button
        className="btn-outline-secondary"
        icon={<DocumentDuplicateIcon className="h-5 w-5" />}
        label={i18n.t('announcement:actions.duplicate')}
        onClick={onDuplicate}
      />
      {announcement.status !== AnnouncementStatus.ARCHIVED && (
        <>
          <Button
            className="btn-outline-secondary"
            icon={<ArchiveBoxIcon className="h-5 w-5" />}
            label={i18n.t('announcement:actions.archive')}
            disabled={isBusy}
            onClick={() => onChangeStatus('archive')}
          />
          <Button
            className="btn-outline-secondary"
            icon={<PencilIcon className="h-5 w-5" />}
            label={i18n.t('announcement:actions.edit')}
            onClick={onEdit}
          />
        </>
      )}
      {announcement.status === AnnouncementStatus.ACTIVE && (
        <Button
          className="btn-secondary"
          icon={<PauseIcon className="h-5 w-5" />}
          label={i18n.t('announcement:actions.deactivate')}
          disabled={isBusy}
          onClick={() => onChangeStatus('deactivate')}
        />
      )}
      {announcement.status === AnnouncementStatus.INACTIVE && (
        <Button
          className="btn-primary"
          icon={<CheckIcon className="h-5 w-5" />}
          label={i18n.t('announcement:actions.activate')}
          disabled={isBusy}
          onClick={() => onChangeStatus('activate')}
        />
      )}
    </>
  );

  return (
    <PageLayout>
      <PageHeader
        onBackButtonPress={onBackButtonPress}
        subtitle={
          announcement ? (
            <span className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={ANNOUNCEMENT_STATUS_TONE[announcement.status]}>
                {i18n.t(`announcement:status.${announcement.status}`)}
              </StatusBadge>
              <AnnouncementTypeChip announcement={announcement} />
            </span>
          ) : undefined
        }
        actions={actions}
      >
        {announcement?.name ?? `${i18n.t('announcement:detail.title')}`}
      </PageHeader>
      {isAnnouncementLoading && <LoadingContent />}
      {announcementError && <EmptyContent description={i18n.t('general:error.load_entries')} />}
      {announcement && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <Card className="xl:col-span-1">
            <div className="px-5 sm:px-6 py-4">
              <h2>{i18n.t('announcement:detail.title')}</h2>
            </div>
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <p className="text-cool-gray-800 whitespace-pre-line break-words">
                {announcement.description}
              </p>
              <ul className="flex flex-col gap-2 text-sm text-cool-gray-700">
                <li className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
                  {formatVolunteersNeeded(announcement)}
                </li>
                <li className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
                  {formatAnnouncementPeriod(announcement)}
                </li>
              </ul>
              <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-cool-gray-200">
                <DetailRow label={`${i18n.t('announcement:header.type')}`}>
                  {i18n.t(`announcement:type.${announcement.type}`)}
                </DetailRow>
                <DetailRow label={`${i18n.t('announcement:header.published_on')}`}>
                  {formatDateWithTime(announcement.publishedOn)}
                </DetailRow>
                <DetailRow label={`${i18n.t('announcement:header.updated_on')}`}>
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4 text-cool-gray-500" aria-hidden="true" />
                    {formatDate(announcement.updatedOn)}
                  </span>
                </DetailRow>
                {announcement.archivedOn && (
                  <DetailRow label={`${i18n.t('announcement:status.archived')}`}>
                    {formatDate(announcement.archivedOn)}
                  </DetailRow>
                )}
              </dl>
            </div>
          </Card>
          <div className="xl:col-span-2">
            <AnnouncementResponses announcementId={announcement.id} />
          </div>
        </div>
      )}
      {selectedIdForDeletion && (
        <ConfirmationModal
          title={i18n.t('announcement:modal.title')}
          description={i18n.t('announcement:modal.description')}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={setSelectedIdForDeletion.bind(null, undefined)}
          onConfirm={onDeleteAnnouncement}
        />
      )}
    </PageLayout>
  );
};

export default Announcement;
