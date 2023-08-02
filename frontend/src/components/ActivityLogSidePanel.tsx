import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { formatDate } from '../common/utils/utils';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  useActivityLogQuery,
  useApproveActivityLogMutation,
  useRejectActivityLogMutation,
} from '../services/activity-log/activity-log.service';
import Button from './Button';
import FormReadOnlyElement from './FormReadOnlyElement';
import LoadingContent from './LoadingContent';
import RejectTextareaModal from './RejectTextareaModal';
import SidePanel from './SidePanel';
import EditActivityLog from './EditActivityLog';

interface ActivityLogSidePanelProps {
  isOpen: boolean;
  onClose: (shouldRefetch?: boolean) => void;
  activityLogId?: string;
}

const ActivityLogSidePanel = ({ isOpen, onClose, activityLogId }: ActivityLogSidePanelProps) => {
  const navigate = useNavigate();

  const [isEditctivityLogSidePanelOpen, setIsEditActivityLogSidePanelOpen] =
    useState<boolean>(false);
  const [shouldActivityLogListRefetch, setShouldActivityLogListRefeth] = useState<boolean>(false);

  // reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);

  // mutations
  const { mutateAsync: approveActivityLog, isLoading: isApproveLoading } =
    useApproveActivityLogMutation();
  const { mutateAsync: rejectActivityLog, isLoading: isRejectLoading } =
    useRejectActivityLogMutation();
  // get one query
  const {
    data: activityLog,
    error: activityLogError,
    refetch,
  } = useActivityLogQuery(activityLogId as string);

  // query error handling
  useEffect(() => {
    if (activityLogError)
      useErrorToast(
        InternalErrors.ACTIVITY_LOG_ERRORS.getError(activityLogError.response?.data.code_error),
      );
  }, [activityLogError]);

  const onVolunteerClick = () => {
    if (activityLog) navigate(`/volunteers/${activityLog.volunteer.id}`);
  };

  const onEventClick = () => {
    if (activityLog) navigate(`/events/${activityLog.event?.id}`);
  };

  const onAprroveOrRejectByClick = () => {
    if (activityLog?.status === ActivityLogStatus.APPROVED) {
      navigate(`/actions-archive?author=${activityLog.approvedBy?.name}`);
    } else if (activityLog?.status === ActivityLogStatus.REJECTED) {
      navigate(`/actions-archive?author=${activityLog?.rejectedBy?.name}`);
    }
  };

  const onAdminClick = () => {
    if (activityLog) navigate(`/actions-archive?author=${activityLog.createdByAdmin?.name}`);
  };

  const onTaskClick = () => {
    if (activityLog) navigate(`/activity-types/edit/${activityLog.activityType?.id}`);
  };

  const onApprove = (id: string) => {
    approveActivityLog(id, {
      onSuccess: () => {
        useSuccessToast(i18n.t('activity_log:form.submit.messages.approve'));
        onClose(true);
      },
      onError: (error) => {
        useErrorToast(InternalErrors.ACTIVITY_LOG_ERRORS.getError(error.response?.data.code_error));
      },
    });
  };

  const onConfirmRejectModal = (rejectionReason?: string) => {
    if (activityLog)
      rejectActivityLog(
        { id: activityLog?.id, rejectionReason },
        {
          onSuccess: () => {
            useSuccessToast(i18n.t('activity_log:form.submit.messages.reject'));
            onClose(true);
          },
          onError: (error) => {
            useErrorToast(
              InternalErrors.ACTIVITY_LOG_ERRORS.getError(error.response?.data.code_error),
            );
          },
          onSettled: () => {
            setIsRejectModalOpen(false);
          },
        },
      );
  };

  const onCloseEditSidePanel = (shouldRefetch?: boolean) => {
    setIsEditActivityLogSidePanelOpen(false);
    if (shouldRefetch) {
      refetch();
      setShouldActivityLogListRefeth(true);
    }
  };

  const onEdit = () => {
    setIsEditActivityLogSidePanelOpen(true);
  };

  const onCloseSidePanel = () => {
    onClose(shouldActivityLogListRefetch);
  };

  return (
    <SidePanel isOpen={isOpen} onClose={onCloseSidePanel}>
      <div className="flex justify-between items-center text-center sm:text-left px-6">
        <h3 className="sm:text-lg lg:text-xl leading-6 font-robotoBold truncate">
          {i18n.t('activity_log:side_panel.title')}
        </h3>
        <div className="flex gap-2">
          {activityLog?.status === ActivityLogStatus.PENDING && (
            <button
              className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
              onClick={onEdit}
              aria-label="edit-activity-log"
              type="button"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
          <button
            className="bg-white rounded-md text-cool-gray-900 hover:text-cool-gray-500 focus:outline-none focus:shadow-blue"
            onClick={onCloseSidePanel}
            aria-label="close-modal"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      {(isApproveLoading || isRejectLoading) && <LoadingContent />}
      {activityLog && !isApproveLoading && !isRejectLoading && (
        <>
          <div className="grow flex flex-col gap-6 pb-24 px-6 overflow-y-auto">
            <FormReadOnlyElement
              label={i18n.t('volunteer:name', { status: '' })}
              value={activityLog.volunteer.name}
              onClick={onVolunteerClick}
            />
            <FormReadOnlyElement
              label={i18n.t('general:task')}
              value={activityLog.activityType?.name || `${i18n.t('general:other')}`}
              onClick={onTaskClick}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.hours')}
              value={activityLog.hours}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:header.execution_date')}
              value={formatDate(activityLog.date)}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.event')}
              value={activityLog.event?.name}
              onClick={activityLog.event && onEventClick}
            />
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.mention')}
              value={activityLog.mentions}
            />
            <hr />
            {activityLog.createdByAdmin ? (
              <FormReadOnlyElement
                label={i18n.t('activity_log:side_panel.created_by')}
                value={activityLog.createdByAdmin?.name}
                onClick={onAdminClick}
              />
            ) : (
              <FormReadOnlyElement
                label={i18n.t('activity_log:side_panel.created_by')}
                value={activityLog.volunteer?.name}
                onClick={onVolunteerClick}
              />
            )}
            <FormReadOnlyElement
              label={i18n.t('activity_log:side_panel.registration_date')}
              value={formatDate(activityLog.createdOn)}
            />
            {activityLog.status === ActivityLogStatus.APPROVED && (
              <>
                <FormReadOnlyElement
                  label={i18n.t('activity_log:side_panel.approved_by')}
                  value={activityLog.approvedBy?.name}
                  onClick={onAprroveOrRejectByClick}
                />
                <FormReadOnlyElement
                  label={i18n.t('activity_log:side_panel.approve_date')}
                  value={formatDate(activityLog.approvedOn)}
                />
              </>
            )}
            {activityLog.status === ActivityLogStatus.REJECTED && (
              <>
                <FormReadOnlyElement
                  label={i18n.t('activity_log:side_panel.rejected_by')}
                  value={activityLog.rejectedBy?.name}
                  onClick={onAprroveOrRejectByClick}
                />
                <FormReadOnlyElement
                  label={i18n.t('activity_log:side_panel.reject_date')}
                  value={formatDate(activityLog.rejectedOn)}
                />
                <FormReadOnlyElement
                  label={i18n.t('activity_log:side_panel.reject_reason')}
                  value={activityLog.rejectionReason}
                />
              </>
            )}
          </div>
          <footer className="p-6 flex flex-row-reverse gap-4 border-t w-full  fixed bottom-0 right-0 bg-white">
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
                  onClick={setIsRejectModalOpen.bind(null, true)}
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
                onClick={setIsRejectModalOpen.bind(null, true)}
                aria-label={`${i18n.t('general:reject')}`}
                icon={<XMarkIcon className="h-5 w-5" />}
                type="button"
              />
            )}
            {activityLog?.status === ActivityLogStatus.REJECTED && (
              <Button
                label={i18n.t('activity_log:side_panel.approve')}
                className="btn-primary"
                onClick={onApprove.bind(null, activityLog.id)}
                aria-label={`${i18n.t('general:reject')}`}
                icon={<CheckIcon className="h-5 w-5" />}
                type="button"
              />
            )}
          </footer>
        </>
      )}
      <EditActivityLog
        onClose={onCloseEditSidePanel}
        isOpen={isEditctivityLogSidePanelOpen}
        activityLog={activityLog}
      />
      {isRejectModalOpen && (
        <RejectTextareaModal
          label={i18n.t('activity_log:modal.description')}
          title={i18n.t('activity_log:modal.title')}
          onClose={setIsRejectModalOpen.bind(null, false)}
          onConfirm={onConfirmRejectModal}
          secondaryBtnLabel={`${i18n.t('activity_log:modal.reject')}`}
          primaryBtnLabel={`${i18n.t('general:reject')}`}
          primaryBtnClassName="btn-danger"
        />
      )}
    </SidePanel>
  );
};

export default ActivityLogSidePanel;
