import {
  ArchiveBoxIcon,
  CheckIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { AnouncementStatusMarkerColorMapper, formatDate } from '../common/utils/utils';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyContent from '../components/EmptyContent';
import FormInput from '../components/FormInput';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import StatusWithMarker from '../components/StatusWithMarker';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAnnouncement,
  useDeleteAnnouncementMutation,
  useChangeAnnouncementStatusMutation,
} from '../services/announcement/announcement.service';
import { AnnouncementStatusAction } from '../services/announcement/announcement.api';

const Announcement = () => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = useState<string>();

  const navigate = useNavigate();

  const { id } = useParams();

  const {
    data: announcement,
    isLoading: isAnnouncementLoading,
    error: announcementError,
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

  const onChangeStatus = (action: AnnouncementStatusAction) => {
    if (announcement) {
      changeStatus(
        { id: announcement.id, action },
        {
          onSuccess: () => {
            onBackButtonPress();
            useSuccessToast(i18n.t(`announcement:submit.messages.${action}`));
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

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={onBackButtonPress}>{i18n.t('general:view')}</PageHeader>
      {isAnnouncementLoading && isUpdateAnnouncementLoading && isDeleteAnnouncementLoading && (
        <LoadingContent />
      )}
      {announcementError && <EmptyContent description={i18n.t('general:error.load_entries')} />}
      {announcement && (
        <Card>
          <CardHeader>
            <h4 className="text-sm sm:text-xl">{i18n.t('announcement:form.title')}</h4>
            <div className="flex flex-row gap-4">
              <Button
                className="btn-text-danger"
                icon={<TrashIcon className="menu-icon" />}
                label={i18n.t('general:delete')}
                onClick={onDelete}
              />
              {announcement.status !== AnnouncementStatus.ARCHIVED && (
                <>
                  <Button
                    className="btn-outline-secondary"
                    label={i18n.t('general:edit', { item: '' })}
                    icon={<PencilIcon className="menu-icon" />}
                    onClick={onEdit}
                  />
                  <Button
                    className="btn-outline-secondary"
                    icon={<ArchiveBoxIcon className="h-5 w-5" />}
                    label={i18n.t('announcement:actions.archive')}
                    onClick={() => onChangeStatus('archive')}
                  />
                </>
              )}
              {announcement.status === AnnouncementStatus.ACTIVE && (
                <Button
                  className="btn-outline-secondary"
                  icon={<PauseIcon className="h-5 w-5" />}
                  label={i18n.t('announcement:actions.deactivate')}
                  onClick={() => onChangeStatus('deactivate')}
                />
              )}
              {announcement.status === AnnouncementStatus.INACTIVE && (
                <Button
                  className="btn-primary"
                  icon={<CheckIcon className="h-5 w-5" />}
                  label={i18n.t('announcement:actions.activate')}
                  onClick={() => onChangeStatus('activate')}
                />
              )}
            </div>
          </CardHeader>
          <CardBody>
            <FormLayout>
              <FormInput
                label={`${i18n.t('announcement:header.name')}`}
                value={announcement.name}
                readOnly
              />
              <FormInput
                label={`${i18n.t('announcement:form.description.label')}`}
                value={announcement.description}
                readOnly
              />
              <FormInput
                label={`${i18n.t('announcement:header.type')}`}
                value={`${i18n.t(`announcement:type.${announcement.type}`)}`}
                readOnly
              />
              <FormInput
                label={`${i18n.t('announcement:header.volunteers_needed')}`}
                value={`${announcement.volunteersNeeded ?? '-'}`}
                readOnly
              />
              <FormInput
                label={`${i18n.t('announcement:header.display_period')}`}
                value={`${formatDate(announcement.displayStartDate)} - ${
                  announcement.displayEndDate
                    ? formatDate(announcement.displayEndDate)
                    : i18n.t('announcement:no_end')
                }`}
                readOnly
              />
              <hr className="border-cool-gray-200" />
              <div className="flex gap-2.5 flex-col">
                <small className="text-cool-gray-500">{i18n.t('announcement:header.status')}</small>
                <StatusWithMarker
                  markerColor={AnouncementStatusMarkerColorMapper[announcement.status]}
                >
                  {i18n.t(`announcement:status.${announcement.status}`)}
                </StatusWithMarker>
              </div>
              {announcement.publishedOn && (
                <FormInput
                  label={`${i18n.t('announcement:header.published_on')}`}
                  value={formatDate(announcement.publishedOn)}
                  readOnly
                />
              )}
              <FormInput
                label={`${i18n.t('announcement:header.updated_on')}`}
                value={formatDate(announcement.updatedOn)}
                readOnly
              />
            </FormLayout>
          </CardBody>
        </Card>
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
