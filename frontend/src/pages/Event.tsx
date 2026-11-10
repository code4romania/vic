import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import {
  ArchiveBoxIcon,
  CheckIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import CardBody from '../components/CardBody';
import Button from '../components/Button';
import LoadingContent from '../components/LoadingContent';
import EmptyContent from '../components/EmptyContent';
import ConfirmationModal from '../components/ConfirmationModal';
import AddEventVolunteersModal from '../components/AddEventVolunteersModal';
import RejectRegistrationModal from '../components/RejectRegistrationModal';
import InitialsAvatar from '../components/InitialsAvatar';
import {
  EventLocation,
  EventPeriod,
  EventStatusBadge,
  EventTargets,
  formatEventDay,
} from '../components/EventCells';
import {
  useArchiveEventMutation,
  useDecideEventRegistrationMutation,
  useDeleteEventMutation,
  useEventQuery,
  useEventRegistrationsQuery,
  usePublishEventMutation,
} from '../services/event/event.service';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { EventDisplayStatus, EventStatus } from '../common/enums/event-status';
import { EventRegistrationStatus } from '../common/enums/event-registration-status.enum';
import { IEvent } from '../common/interfaces/event.interface';
import { IEventRegistration } from '../common/interfaces/event-registration.interface';
import RsvpTableWithQueryParams from '../containers/query/RsvpTableWithQueryParams';
import { useValidationGate } from '../hooks/useValidationGate';

// #496: volunteers can be added while the event is published and has not finished
const canAddVolunteers = (event: IEvent): boolean =>
  event.status === EventStatus.PUBLISHED &&
  (event.displayStatus ?? event.status) !== EventDisplayStatus.FINISHED;

const InfoItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-robotoMedium uppercase tracking-wide text-cool-gray-500">
      {label}
    </span>
    {children}
  </div>
);

const EventInfo = ({ event, going }: { event: IEvent; going?: number }) => {
  const status = event.displayStatus || event.status;
  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('events:details')}</h2>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-6">
          <InfoItem label={i18n.t('events:detail.description')}>
            <p className="whitespace-pre-line text-cool-gray-800">{event.description}</p>
          </InfoItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoItem label={i18n.t('events:detail.period')}>
              <EventPeriod event={event} />
            </InfoItem>
            <InfoItem label={i18n.t('events:detail.location')}>
              <EventLocation location={event.location} />
            </InfoItem>
            <InfoItem label={i18n.t('events:detail.departments')}>
              <EventTargets event={event} />
            </InfoItem>
            <InfoItem label={i18n.t('events:detail.capacity')}>
              <span className="text-sm font-robotoMedium text-cool-gray-900">
                {event.capacity
                  ? i18n.t('events:detail.capacity_value', {
                      going: going ?? 0,
                      capacity: event.capacity,
                    })
                  : i18n.t('events:detail.capacity_unlimited', { going: going ?? 0 })}
              </span>
              {!!event.capacity && (
                <div className="h-1.5 w-full max-w-[16rem] rounded-full bg-cool-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-figure-green"
                    style={{
                      width: `${Math.min(100, Math.round(((going ?? 0) / event.capacity) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </InfoItem>
          </div>
          {/* what the status means for the volunteers */}
          <div className="flex items-start gap-3 rounded-lg border border-cool-gray-200 bg-cool-gray-50 p-4">
            <InformationCircleIcon
              className="w-5 h-5 shrink-0 text-navy mt-0.5"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-robotoMedium text-cool-gray-900">
                {i18n.t(`events:${status}.subtitle`)}
              </span>
              <span className="text-sm text-cool-gray-600">
                {i18n.t(`events:${status}.description`)}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// #501: the event's registrations waiting for the NGO's decision
const PendingRegistrations = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<IEventRegistration>();
  const { data, isLoading } = useEventRegistrationsQuery({
    status: EventRegistrationStatus.PENDING,
    page: 1,
    limit: 50,
    eventId,
  });
  const { mutate: decide, isLoading: isDeciding } = useDecideEventRegistrationMutation();
  const { blocked, gate } = useValidationGate();
  const items = data?.items ?? [];
  const total = data?.meta?.totalItems ?? items.length;

  const onDecide = (row: IEventRegistration, reason?: string) =>
    decide(
      { id: row.id, reason },
      {
        onSuccess: () => {
          useSuccessToast(
            i18n.t(
              reason === undefined
                ? 'events:registrations.approved'
                : 'events:registrations.rejected',
              { name: row.user.name },
            ),
          );
          setRejecting(undefined);
          queryClient.invalidateQueries(['event-registrations']);
          queryClient.invalidateQueries(['rsvp']);
        },
        onError: (error) =>
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)),
      },
    );

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2">
          <ExclamationCircleIcon
            className={`w-5 h-5 ${total ? 'text-figure-amber' : 'text-cool-gray-400'}`}
            aria-hidden="true"
          />
          {i18n.t('events:detail.pending_title', { count: total })}
        </h2>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-cool-gray-500">{i18n.t('events:detail.pending_hint')}</p>
          {isLoading ? (
            <LoadingContent />
          ) : items.length === 0 ? (
            <p className="text-sm text-cool-gray-500">{i18n.t('events:detail.pending_empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-cool-gray-200 p-3"
                >
                  <InitialsAvatar name={row.user.name} />
                  <div className="flex flex-col min-w-[10rem] flex-1">
                    <span className="text-sm font-robotoMedium text-cool-gray-900 truncate">
                      {row.user.name}
                    </span>
                    <span className="text-xs text-cool-gray-500">
                      {i18n.t('events:detail.registered_on', {
                        date: formatEventDay(row.createdOn),
                      })}
                      {' · '}
                      {i18n.t(
                        `events:registrations.volunteer_status.${row.volunteerStatus ?? 'none'}`,
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-secondary py-1.5"
                      {...gate}
                      disabled={isDeciding || blocked}
                      aria-label={`${i18n.t('events:registrations.approve')} ${row.user.name}`}
                      onClick={() => onDecide(row)}
                    >
                      <CheckIcon className="w-4 h-4" aria-hidden="true" />
                      {i18n.t('events:registrations.approve')}
                    </button>
                    <button
                      type="button"
                      className="btn-outline-danger py-1.5"
                      disabled={isDeciding}
                      aria-label={`${i18n.t('events:registrations.reject.button')} ${
                        row.user.name
                      }`}
                      onClick={() => setRejecting(row)}
                    >
                      <XMarkIcon className="w-4 h-4" aria-hidden="true" />
                      {i18n.t('events:registrations.reject.button')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/approvals/events" className="self-start text-sm text-navy hover:underline">
            {i18n.t('events:detail.all_registrations')}
          </Link>
        </div>
      </CardBody>
      {rejecting && (
        <RejectRegistrationModal
          name={rejecting.user.name}
          isLoading={isDeciding}
          onClose={() => setRejecting(undefined)}
          onConfirm={(reason) => onDecide(rejecting, reason)}
        />
      )}
    </Card>
  );
};

// VIC 2.0 redesign: one page with the event, its pending registrations and every answer (#496,
// #497, #501). Edit, publish/archive and delete stay here.
const Event = () => {
  const [showDeleteEvent, setShowDeleteEvent] = useState<boolean>();
  const [showAddVolunteers, setShowAddVolunteers] = useState<boolean>(false);
  const { gate } = useValidationGate();

  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event, isLoading, error } = useEventQuery(id as string);
  // registered = approved "going" registrations; the event itself does not carry the count
  const { data: approved } = useEventRegistrationsQuery({
    status: EventRegistrationStatus.APPROVED,
    page: 1,
    limit: 1,
    eventId: id as string,
  });

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

  const busy = isLoading || isPublishingEvent || isArchivingEvent || isDeletingEvent;

  const actions = event && (
    <>
      <Button
        className="btn-outline-danger"
        label={i18n.t('general:delete')}
        icon={<TrashIcon className="h-5 w-5" aria-hidden="true" />}
        onClick={() => setShowDeleteEvent(true)}
      />
      {event.status === EventStatus.PUBLISHED && (
        <Button
          className="btn-outline-secondary"
          label={i18n.t('general:archive', { item: '' })}
          icon={<ArchiveBoxIcon className="h-5 w-5 text-cool-gray-500" aria-hidden="true" />}
          onClick={onArchive}
        />
      )}
      <Button
        className="btn-outline-secondary"
        label={i18n.t('general:edit', { item: '' })}
        icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" aria-hidden="true" />}
        onClick={() => navigate(`/events/${id}/edit`)}
      />
      {event.status !== EventStatus.PUBLISHED && (
        <Button
          className="btn-primary"
          label={i18n.t('general:publish')}
          icon={<CloudArrowUpIcon className="h-5 w-5" aria-hidden="true" />}
          onClick={onPublish}
          {...gate}
        />
      )}
      {canAddVolunteers(event) && (
        <Button
          className="btn-primary"
          label={i18n.t('events:add_volunteers.button')}
          icon={<UserPlusIcon className="h-5 w-5" aria-hidden="true" />}
          onClick={() => setShowAddVolunteers(true)}
          {...gate}
        />
      )}
    </>
  );

  return (
    <PageLayout>
      <PageHeader
        onBackButtonPress={navigateBack}
        subtitle={event ? <EventStatusBadge event={event} /> : undefined}
        actions={busy ? undefined : actions}
      >
        {event?.name ?? i18n.t('general:view')}
      </PageHeader>
      {busy ? (
        <LoadingContent />
      ) : event ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6 items-start">
            <div className="xl:col-span-2 flex">
              <EventInfo event={event} going={approved?.meta?.totalItems} />
            </div>
            <PendingRegistrations eventId={event.id} />
          </div>
          <RsvpTableWithQueryParams eventId={event.id} eventName={event.name} />
        </>
      ) : (
        <Card>
          <CardBody>
            <EmptyContent description={i18n.t('general:error.load_entries')} />
          </CardBody>
        </Card>
      )}
      {showAddVolunteers && event && (
        <AddEventVolunteersModal eventId={event.id} onClose={() => setShowAddVolunteers(false)} />
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
    </PageLayout>
  );
};

export default Event;
