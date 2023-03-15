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
  useRsvpsQuery,
} from '../services/event/event.service';
import Button from '../components/Button';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import FormLayout from '../layouts/FormLayout';
import Paragraph from '../components/Paragraph';
import FormReadOnlyElement from '../components/FormReadOnlyElement';
import { formatDateWithTime } from '../common/utils/utils';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { EventStatus } from '../common/enums/event-status';
import ConfirmationModal from '../components/ConfirmationModal';
import { IEvent } from '../common/interfaces/event.interface';
import { AttendanceType } from '../common/enums/attendance-type.enum';
import DataTableComponent from '../components/DataTableComponent';
import MediaCell from '../components/MediaCell';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { SortOrder, TableColumn } from 'react-data-table-component';
import { IRsvp } from '../common/interfaces/rsvp.interface';

enum EventTab {
  EVENT = 'event',
  RESPONSES = 'responses',
}

const EventTabs: SelectItem<EventTab>[] = [
  { key: EventTab.EVENT, value: i18n.t('events:details') },
  { key: EventTab.RESPONSES, value: i18n.t('events:responses_list') },
];

const TableHeader = [
  {
    id: 'name',
    name: i18n.t('general:name'),
    sortable: true,
    minWidth: '10rem',
    grow: 2,
    cell: (row: IRsvp) => <MediaCell logo={row.logo} title={row.userName} />,
  },
  {
    id: 'answer',
    name: i18n.t('general:answer'),
    minWidth: '11rem',
    grow: 1,
    sortable: true,
    selector: (row: IRsvp) =>
      row.going ? i18n.t('events:participate') : i18n.t('events:not_participate'),
  },
  {
    id: 'volunteer',
    name: i18n.t('events:volunteer'),
    minWidth: '10rem',
    grow: 1,
    sortable: true,
    selector: (row: IRsvp) => (row.volunteerId ? i18n.t('general:yes') : i18n.t('general:no')),
  },
  {
    id: 'mention',
    name: i18n.t('events:form.mention.label'),
    minWidth: '9rem',
    grow: 1,
    selector: (row: IRsvp) => (row.mention ? row.mention : '-'),
  },
];

interface EventDetailsProps {
  event: IEvent;
  onDelete: () => void;
  onArchive: () => void;
  onEdit: () => void;
  onPublish: () => void;
}

const EventDetails = ({ event, onDelete, onArchive, onEdit, onPublish }: EventDetailsProps) => (
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
          onClick={onEdit}
        />
        {event.status === EventStatus.PUBLISHED ? (
          <Button
            className="btn-outline-secondary"
            label={i18n.t('general:archive', { item: '' })}
            icon={<ArchiveBoxIcon className="h-5 w-5 sm:hidden" />}
            onClick={onArchive}
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
        <Paragraph title={`${i18n.t('events:details')}`}>{''}</Paragraph>
        <FormReadOnlyElement label={i18n.t('events:form.name.label')} value={event.name} />
        <FormReadOnlyElement
          label={i18n.t('events:form.start_date.label')}
          value={`${formatDateWithTime(event.startDate)}`}
        />
        <FormReadOnlyElement
          label={i18n.t('events:form.end_date.label')}
          value={event.endDate ? `${formatDateWithTime(event.endDate)}` : '-'}
        />
        <FormReadOnlyElement label={i18n.t('events:form.location.label')} value={event.location} />
        <FormReadOnlyElement
          label={i18n.t('events:form.target.label')}
          value={event.targets?.map((target) => `${target.name}`).join(', ')}
        />
        <FormReadOnlyElement
          label={i18n.t('events:form.description.label')}
          value={event.description}
        />
        <div className="flex gap-2.5 flex-col">
          <small className="text-cool-gray-500">{i18n.t('events:form.logo.label')}</small>
          {event.image ? (
            <img
              src={event.image}
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
        <Paragraph title={i18n.t('events:form.noting.label')}>{''}</Paragraph>
        <FormReadOnlyElement
          label={i18n.t('events:form.noting.label')}
          value={`${
            event.attendanceType === AttendanceType.MENTION
              ? i18n.t('events:form.noting.mention')
              : i18n.t('events:form.noting.simple')
          }`}
        />
        <FormReadOnlyElement
          label={i18n.t('events:form.mention.label')}
          value={
            event.attendanceMention
              ? event.attendanceMention
              : `${i18n.t('events:form.mention.empty')}`
          }
        />
        <hr className="border-cool-gray-200 mb-2 mt-10" />

        <Paragraph title={i18n.t('events:form.task.title')}>{''}</Paragraph>
        <div className="flex gap-2.5 flex-col">
          <small className="text-cool-gray-500">{i18n.t('events:form.task.tasks')}</small>
          <div className="flex gap-2 flex-wrap">
            {event.tasks.map((tasks) => (
              <div
                key={tasks.id}
                className="h-7 rounded-xl bg-gray-100 shadow-sm px-3 grid place-items-center"
              >
                <small>{tasks.name}</small>
              </div>
            ))}
          </div>
        </div>
        <hr className="border-cool-gray-200 mb-2 mt-10" />
        <Paragraph title={i18n.t('events:form.observation.title')}>{''}</Paragraph>
        <FormReadOnlyElement
          label={i18n.t('events:form.observation.label')}
          value={event.observation}
        />
      </FormLayout>
    </CardBody>
  </Card>
);

const Event = () => {
  const [showDeleteEvent, setShowDeleteEvent] = useState<boolean>();
  const [tabsStatus, setTabsStatus] = useState<EventTab>(EventTab.EVENT);
  // pagination state
  const [page, setPage] = useState<number>();
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [orderByColumn, setOrderByColumn] = useState<string>();
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event, isLoading, error } = useEventQuery(id as string);
  const {
    data: rsvps,
    isLoading: isRsvpsLoading,
    error: rsvpsError,
  } = useRsvpsQuery(id as string, rowsPerPage, page, orderByColumn, orderDirection);
  const { mutateAsync: archiveEvent, isLoading: isArchivingEvent } = useArchiveEventMutation();
  const { mutateAsync: publishEvent, isLoading: isPublishingEvent } = usePublishEventMutation();
  const { mutateAsync: deleteEvent, isLoading: isDeletingEvent } = useDeleteEventMutation();

  useEffect(() => {
    if (error) {
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(error?.response?.data.code_error));
    }
    if (rsvpsError) {
      useErrorToast(InternalErrors.EVENT_ERRORS.getError(rsvpsError?.response?.data.code_error));
    }
  }, [error, rsvpsError]);

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onTabClick = (tab: EventTab) => {
    setTabsStatus(tab);
  };

  const onDelete = () => {
    setShowDeleteEvent(true);
  };

  const onEdit = () => {
    navigate(`/events/${id}/edit`, { replace: true });
  };

  const confirmDelete = () => {
    if (event)
      deleteEvent(event.id, {
        onSuccess: () => {
          useSuccessToast(`${i18n.t('events:modal.delete')}`);
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

  const onArchive = () => {
    if (event)
      archiveEvent(event.id, {
        onSuccess: () => {
          useSuccessToast(`${i18n.t('events:form.submit.archived')}`);
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
          useSuccessToast(`${i18n.t('events:form.submit.published')}`);
          navigateBack();
        },
        onError: (error) => {
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error));
        },
      });
  };

  const onSort = (column: TableColumn<IRsvp>, direction: SortOrder) => {
    setOrderByColumn(column.id as string);
    setOrderDirection(
      direction.toLocaleUpperCase() === OrderDirection.ASC
        ? OrderDirection.ASC
        : OrderDirection.DESC,
    );
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{i18n.t('general:view')}</PageHeader>
      <Tabs<EventTab> tabs={EventTabs} onClick={onTabClick}>
        {tabsStatus === EventTab.EVENT && (
          <>
            {isLoading || isPublishingEvent || isArchivingEvent || isDeletingEvent ? (
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
            ) : event ? (
              <EventDetails
                event={event}
                onArchive={onArchive}
                onDelete={onDelete}
                onPublish={onPublish}
                onEdit={onEdit}
              />
            ) : (
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
          </>
        )}
        {tabsStatus === EventTab.RESPONSES && (
          <Card>
            <CardHeader>
              <h2>{i18n.t('events:responses_list')}</h2>
              <Button
                label={i18n.t('general:download_table')}
                icon={<ArrowDownTrayIcon className="h-5 w-5 text-cool-gray-600" />}
                className="btn-outline-secondary ml-auto"
                onClick={() => alert('Not implemented')}
              />
            </CardHeader>
            <CardBody>
              <DataTableComponent
                columns={TableHeader}
                data={rsvps?.items}
                loading={isRsvpsLoading}
                pagination
                paginationPerPage={rowsPerPage}
                paginationTotalRows={rsvps?.meta?.totalItems}
                paginationDefaultPage={page}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setPage}
                onSort={onSort}
              />
            </CardBody>
          </Card>
        )}
      </Tabs>
    </PageLayout>
  );
};

export default Event;
