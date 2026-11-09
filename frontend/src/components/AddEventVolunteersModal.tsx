import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  useAddVolunteersToEventMutation,
  useEventCandidatesQuery,
} from '../services/event/event.service';
import Button from './Button';
import LoadingContent from './LoadingContent';
import Modal from './Modal';

interface AddEventVolunteersModalProps {
  eventId: string;
  onClose: () => void;
}

// VIC 2.0 (#496): the NGO picks active volunteers from the event's departments (with their approved
// hours in the organization) and registers them right away. The API keeps to the capacity.
const AddEventVolunteersModal = ({ eventId, onClose }: AddEventVolunteersModalProps) => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useEventCandidatesQuery(eventId, search);
  const candidates = data?.items;
  // null: the event has no capacity
  const placesLeft = data?.placesLeft ?? null;
  const { mutate: addVolunteers, isLoading: isAdding } = useAddVolunteersToEventMutation();

  const toggle = (volunteerId: string) =>
    setSelected((current) =>
      current.includes(volunteerId)
        ? current.filter((id) => id !== volunteerId)
        : [...current, volunteerId],
    );

  const overCapacity = placesLeft !== null && selected.length > placesLeft;

  const onSubmit = () => {
    addVolunteers(
      { eventId, volunteerIds: selected },
      {
        onSuccess: (added) => {
          useSuccessToast(i18n.t('events:add_volunteers.added', { count: added.length }));
          queryClient.invalidateQueries(['event', eventId]);
          queryClient.invalidateQueries(['rsvp']);
          queryClient.invalidateQueries(['event-candidates', eventId]);
          onClose();
        },
        onError: (error) =>
          useErrorToast(InternalErrors.EVENT_ERRORS.getError(error.response?.data.code_error)),
      },
    );
  };

  return (
    <Modal title={i18n.t('events:add_volunteers.title')} onClose={onClose}>
      <div className="flex flex-col gap-4 text-left">
        <p className="text-sm text-cool-gray-500">{i18n.t('events:add_volunteers.description')}</p>
        <input
          type="search"
          className="block w-full rounded-md border-cool-gray-200 text-sm"
          placeholder={`${i18n.t('events:add_volunteers.search')}`}
          aria-label={`${i18n.t('events:add_volunteers.search')}`}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        {placesLeft !== null && (
          <p
            role="status"
            className={`text-sm ${overCapacity ? 'text-red-500' : 'text-cool-gray-500'}`}
          >
            {i18n.t('events:add_volunteers.places', {
              count: Math.max(placesLeft - selected.length, 0),
            })}
          </p>
        )}
        <div className="max-h-80 overflow-y-auto flex flex-col divide-y divide-cool-gray-100">
          {isLoading && <LoadingContent />}
          {!isLoading && !candidates?.length && (
            <p className="text-sm text-cool-gray-500 py-4">
              {i18n.t('events:add_volunteers.empty')}
            </p>
          )}
          {candidates?.map((candidate) => (
            <label
              key={candidate.volunteerId}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="rounded border-cool-gray-300"
                checked={candidate.registered || selected.includes(candidate.volunteerId)}
                disabled={candidate.registered}
                onChange={() => toggle(candidate.volunteerId)}
              />
              <span className="flex flex-col min-w-0 grow">
                <span className="font-robotoBold truncate">{candidate.name}</span>
                <small className="text-cool-gray-500 truncate">
                  {[candidate.department, candidate.email].filter(Boolean).join(' · ')}
                </small>
              </span>
              <small className="whitespace-nowrap tabular-nums text-cool-gray-500">
                {candidate.registered
                  ? i18n.t('events:add_volunteers.registered')
                  : i18n.t('events:add_volunteers.hours', { count: candidate.totalHours })}
              </small>
            </label>
          ))}
        </div>
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="button"
            label={i18n.t('events:add_volunteers.submit', { count: selected.length })}
            className="btn-primary"
            disabled={!selected.length || overCapacity || isAdding}
            onClick={onSubmit}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AddEventVolunteersModal;
