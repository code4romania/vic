import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import { SelectItem } from '../components/Select';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import {
  useArchiveEventMutation,
  useDeleteEventMutation,
  useEventQuery,
  usePublishEventMutation,
} from '../services/event/event.service';
import Button from '../components/Button';
import { CloudArrowUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormReadOnlyElement from '../components/FormReadOnlyElement';
import { formatEventDate } from '../common/utils/utils';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { EventStatus } from '../common/enums/event-status';
import ConfirmationModal from '../components/ConfirmationModal';

enum EventTab {
  EVENT = 'event',
  RESPONSES = 'responses',
}

const EventTabs: SelectItem<EventTab>[] = [
  { key: EventTab.EVENT, value: i18n.t('events:details') },
  { key: EventTab.RESPONSES, value: i18n.t('events:responses_list') },
];

const Event = () => {
  const [showDeleteEvent, setShowDeleteEvent] = useState<boolean>();
  const [tabsStatus, setTabsStatus] = useState<EventTab>(EventTab.EVENT);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event, isLoading, error } = useEventQuery(id as string);
  const { mutateAsync: archiveEvent, isLoading: isArchivingEvent } = useArchiveEventMutation();
  const { mutateAsync: publishEvent, isLoading: isPublishingEvent } = usePublishEventMutation();
  const { mutateAsync: deleteEvent, isLoading: isDeletingEvent } = useDeleteEventMutation();

  useEffect(() => {
    if (error) {
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(error?.response?.data.code_error));
    }
  }, [error]);

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onTabClick = (tab: EventTab) => {
    setTabsStatus(tab);
  };

  const onDelete = () => {
    setShowDeleteEvent(true);
  };

  const confirmDelete = () => {
    if (event)
      deleteEvent(event.id, {
        onSuccess: () => {
          useSuccessToast('events:modal.delete');
          navigateBack();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
        onSettled: () => {
          setShowDeleteEvent(false);
        },
      });
  };

  const onEdit = () => {
    navigate(`/events/${id}/edit`, { replace: true });
  };

  const onArchive = () => {
    if (event)
      archiveEvent(event.id, {
        onSuccess: () => {
          useSuccessToast('events:form.submit.archived');
          navigateBack();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
      });
  };

  const onPublish = () => {
    if (event)
      publishEvent(event.id, {
        onSuccess: () => {
          useSuccessToast('events:form.submit.published');
          navigateBack();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
      });
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{i18n.t('general:view')}</PageHeader>
      <Tabs<EventTab> tabs={EventTabs} onClick={onTabClick}>
        {tabsStatus === EventTab.EVENT &&
          event &&
          !isLoading &&
          !isArchivingEvent &&
          !isPublishingEvent &&
          !isDeletingEvent && (
            <Card>
              <CardHeader>
                <h2>{i18n.t('events:details')}</h2>
                <div className="flex flex-row gap-2 sm:gap-4">
                  <Button
                    className="btn-outline-danger"
                    label={i18n.t('general:delete')}
                    icon={<TrashIcon className="h-5 w-5 sm:hidden" aria-hidden="true" />}
                    onClick={onDelete}
                  />
                  <Button
                    className="btn-outline-secondary"
                    label={i18n.t('general:edit', { item: '' })}
                    icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
                    onClick={onArchive}
                  />
                  {event.status === EventStatus.PUBLISHED ? (
                    <Button
                      className="btn-outline-secondary"
                      label={i18n.t('general:edit', { item: '' })}
                      icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
                      onClick={onEdit}
                    />
                  ) : (
                    <Button
                      className="btn-primary"
                      label={i18n.t('general:publish')}
                      icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
                      onClick={onPublish}
                    />
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <FormLayout>
                  <Paragraph title={`${i18n.t(`events:${event.status}.subtitle`)}`}>
                    {i18n.t(`events:${event.status}.description`)}
                  </Paragraph>
                  <hr className="border-cool-gray-200 mb-2 mt-10" />
                  <Paragraph title={`${i18n.t('events:details')}`}>
                    {i18n.t(`events:observation`)}
                  </Paragraph>
                  <FormReadOnlyElement
                    label={i18n.t('events:form.name.label')}
                    value={event.name}
                  />
                  <FormReadOnlyElement
                    label={i18n.t('events:form.start_date.label')}
                    value={`${formatEventDate(event.startDate)}`}
                  />
                  <FormReadOnlyElement
                    label={i18n.t('events:form.end_date.label')}
                    value={event.endDate ? `${formatEventDate(event.endDate)}` : '-'}
                  />
                  <FormReadOnlyElement
                    label={i18n.t('events:form.location.label')}
                    value={event.location}
                  />
                  <FormReadOnlyElement
                    label={i18n.t('events:form.target.label')}
                    value={event.targets
                      ?.map((target) => `${target.name} (${target.numberOfMembers})`)
                      .join(', ')}
                  />
                  <FormReadOnlyElement
                    label={i18n.t('events:form.description.label')}
                    value={event.description}
                  />
                  <div className="flex gap-2.5 flex-col">
                    <small className="text-cool-gray-500">{i18n.t('events:form.logo.label')}</small>
                    {event.logo ? (
                      <img
                        src={event.logo}
                        className="w-20 h-20 logo text-transparent"
                        alt={`${event.name} picture`}
                      />
                    ) : (
                      <Button
                        className="btn-primary"
                        label={i18n.t('general:publish')}
                        icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
                        onClick={onPublish}
                      />
                    )}
                  </div>
                  <hr className="border-cool-gray-200 mb-2 mt-10" />
                  <h3>{i18n.t('events:form.observation.title')}</h3>
                  <FormReadOnlyElement
                    label={i18n.t('events:form.observation.label')}
                    value={event.observation}
                  />
                </FormLayout>
              </CardBody>
            </Card>
          )}
        {tabsStatus === EventTab.EVENT &&
          isLoading &&
          isPublishingEvent &&
          isArchivingEvent &&
          isDeletingEvent && (
            <Card>
              <CardHeader>
                <h2>{i18n.t('events:details')}</h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-center min-h-screen">
                  <LoadingContent />
                </div>
              </CardBody>
            </Card>
          )}
        {tabsStatus === EventTab.EVENT &&
          !event &&
          !isLoading &&
          !isArchivingEvent &&
          !isPublishingEvent &&
          !isDeletingEvent && (
            <Card>
              <CardHeader>
                <h2>{i18n.t('events:details')}</h2>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-center min-h-screen">
                  <EmptyContent description={i18n.t('general:error.load_entries')} />
                </div>
              </CardBody>
            </Card>
          )}
      </Tabs>
      {showDeleteEvent && (
        <ConfirmationModal
          title={i18n.t('events:modal.title')}
          description={i18n.t('events:modal.description')}
          confirmBtnLabel={i18n.t('division:modal.delete.title', {
            division: i18n.t('general:event').toLowerCase(),
          })}
          confirmBtnClassName="btn-danger"
          onClose={setShowDeleteEvent.bind(null, false)}
          onConfirm={confirmDelete}
        />
      )}
    </PageLayout>
  );
};

export default Event;
