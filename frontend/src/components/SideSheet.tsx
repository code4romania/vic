import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { IActivityLog } from '../common/interfaces/activity-log.interface';
import { formatDate } from '../common/utils/utils';
import Button from './Button';
import FormReadOnlyElement from './FormReadOnlyElement';
import FormReadOnlyName from './FormReadOnlyName';
import SidePanel from './SidePanel';

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onReject: (id: string) => void;
  onApprove: (id: string) => void;
  activityLog?: IActivityLog;
}

const SideSheet = ({
  isOpen,
  onClose,
  onEdit,
  onReject,
  onApprove,
  activityLog,
}: SideSheetProps) => {
  const navigate = useNavigate();

  const onVolunteerClick = (id: string) => {
    navigate(`/volunteers/${id}`);
  };

  return (
    <SidePanel isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center text-center sm:text-left px-6">
        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {i18n.t('activity_log:side_panel.title')}
        </h3>
        <div className="flex gap-2">
          <button
            className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
            onClick={onEdit}
            aria-label="edit-activity-log"
            type="button"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
            onClick={onClose}
            aria-label="close-modal"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      {activityLog && (
        <>
          <div className="grow px-6 flex flex-col gap-8">
            <FormReadOnlyName
              label={i18n.t('volunteer:name', { status: '' })}
              value={activityLog.volunteer.name}
              onClick={onVolunteerClick.bind(null, activityLog.volunteer.id)}
            />
            <div className="flex gap-2.5 flex-col">
              <small className="text-cool-gray-500">
                {i18n.t('volunteer:name', { status: '' })}
              </small>
              <a>{activityLog.volunteer.name}</a>
            </div>
            <FormReadOnlyElement label={i18n.t('general:task')} value={activityLog.task.name} />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.hours')}
              value={activityLog.hours}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:execution_date')}
              value={formatDate(activityLog.executionDate)}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.event')}
              value={activityLog.event?.name}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.mention')}
              value={activityLog.mention}
            />
            <hr />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.registered_by')}
              value={activityLog.registeredBy?.name}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.registration_date')}
              value={formatDate(activityLog.registrationDate)}
            />
          </div>
          <footer className="px-6 pt-6 flex flex-row-reverse gap-4 border-t">
            {activityLog.status === ActivityLogStatus.PENDING && (
              <>
                <Button
                  label={i18n.t('general:approve')}
                  className="btn-primary"
                  onClick={onApprove.bind(null, activityLog.id)}
                  aria-label={`${i18n.t('general:approve')}`}
                  icon={<CheckIcon className="h-5 w-5" />}
                  type="button"
                />
                <Button
                  label={i18n.t('general:reject')}
                  className="btn-text-danger"
                  onClick={onReject.bind(null, activityLog.id)}
                  aria-label={`${i18n.t('general:reject')}`}
                  icon={<XMarkIcon className="h-5 w-5" />}
                  type="button"
                />
              </>
            )}
            {activityLog?.status === ActivityLogStatus.APPROVED && (
              <Button
                label={i18n.t('activity_log:side_panel.reject')}
                className="btn-text-danger"
                onClick={onReject.bind(null, activityLog.id)}
                aria-label={`${i18n.t('general:reject')}`}
                icon={<XMarkIcon className="h-5 w-5" />}
                type="button"
              />
            )}
            {activityLog?.status === ActivityLogStatus.REJECTED && (
              <Button
                label={i18n.t('activity_log:side_panel.approve')}
                className="btn-primary"
                onClick={onReject.bind(null, activityLog.id)}
                aria-label={`${i18n.t('general:reject')}`}
                icon={<CheckIcon className="h-5 w-5" />}
                type="button"
              />
            )}
          </footer>
        </>
      )}
    </SidePanel>
  );
};

export default SideSheet;
