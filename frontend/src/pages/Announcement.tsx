import { PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { AnnouncementStatus } from '../common/enums/announcement-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { formatDate, mapTargetsToString } from '../common/utils/utils';
import Button from '../components/Button';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyContent from '../components/EmptyContent';
import FormInput from '../components/FormInput';
import LoadingContent from '../components/LoadingContent';
import PageHeader from '../components/PageHeader';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import Card from '../layouts/CardLayout';
import FormLayout from '../layouts/FormLayout';
import PageLayout from '../layouts/PageLayout';
import {
  useAnnouncementQuery,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from '../services/announcement/announcement.service';

const Announcement = () => {
  const [selectedIdForDeletion, setSelectedIdForDeletion] = React.useState<string>();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: announcement,
    isLoading: isAnnouncementLoading,
    error: announcementError,
  } = useAnnouncementQuery(id as string);
  const { mutateAsync: updateAnnouncement, isLoading: isUpdateAnnouncementLoading } =
    useUpdateAnnouncementMutation();
  const { mutateAsync: deleteAnnouncement, isLoading: isDeleteAnnouncementLoading } =
    useDeleteAnnouncementMutation();

  React.useEffect(() => {
    if (announcementError)
      useErrorToast(
        InternalErrors.ANNOUNCEMENT_ERRORS.getError(announcementError.response?.data.code_error),
      );
  }, [announcementError]);

  const onNavigateBack = () => {
    navigate('/announcements');
  };

  const onPublish = () => {
    if (announcement) {
      const targetsIds = announcement.targets
        ? announcement.targets.map((target) => target.id)
        : [];
      updateAnnouncement(
        {
          id: announcement.id,
          updateData: {
            status: AnnouncementStatus.PUBLISHED,
            targetsIds,
          },
        },
        {
          onSuccess: () => {
            onNavigateBack();
            useSuccessToast(i18n.t('announcement:success.create_publish'));
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
          useSuccessToast(i18n.t('announcement:success.delete'));
          onNavigateBack();
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
      <PageHeader onBackButtonPress={onNavigateBack}>{i18n.t('general:view')}</PageHeader>
      {isAnnouncementLoading && isUpdateAnnouncementLoading && isDeleteAnnouncementLoading && (
        <LoadingContent />
      )}
      {announcementError && <EmptyContent description={i18n.t('general:error.load_entries')} />}
      {announcement && (
        <Card>
          <CardHeader>
            <h1>{i18n.t('announcement:form.title')}</h1>
            <div className="flex flex-row gap-3">
              <Button
                className="btn-text-danger"
                label={i18n.t('general:delete')}
                onClick={onDelete}
              />
              <div>
                <Button
                  className="btn-outline-secondary"
                  label={i18n.t('general:edit', { item: '' })}
                  icon={<PencilIcon className="menu-icon" />}
                  onClick={onEdit}
                />
                <Button
                  className="btn-primary"
                  label={i18n.t('announcement:publish')}
                  onClick={onPublish}
                />
              </div>
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
                label={`${i18n.t('announcement:header.target')}`}
                value={
                  announcement.targets.length !== 0
                    ? mapTargetsToString(announcement)
                    : `(${announcement.targetedVolunteers}) ${i18n.t(
                        'announcement:all_organization',
                      )}`
                }
                readOnly
              />
              <hr className="border-cool-gray-200" />
              <FormInput
                label={`${i18n.t('announcement:header.status')}`}
                value={`${i18n.t(`announcement:status.${announcement.status}`)}`}
                readOnly
              />
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
