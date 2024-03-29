import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import FormLayout from '../layouts/FormLayout';
import {
  useActivityLogQuery,
  useCancelActivityLogMutation,
} from '../services/activity-log/activity-log.service';
import Disclaimer from '../components/Disclaimer';
import { ActivityLogStatusToColorMapper } from '../common/utils/utils';
import { useTranslation } from 'react-i18next';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ButtonType } from '../common/enums/button-type.enum';
import { Divider } from '@ui-kitten/components';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import ActivityLogSkeleton from '../components/skeleton/activity-log-skeleton';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';

const ActivityLog = ({ navigation, route }: any) => {
  console.log('ActivityLog');
  // translations
  const { t } = useTranslation('activity_log');
  const { activityLogId } = route.params;
  // activity log query
  const { activityLog } = useActivityLogs();

  const { isFetching: isLoadingActivityLog } = useActivityLogQuery(activityLogId);
  // cancel activity log
  const { isLoading: isCancelingLog, mutate: cancelLog } = useCancelActivityLogMutation();

  const onDeleteLogBtnPress = () => {
    cancelLog(
      { activityLogId },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (error: any) => {
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.ACTIVITY_LOG_ERRORS.getError(
              error.response?.data.code_error,
            )}`,
          });
        },
      },
    );
  };

  const onEditActivityLog = () => {
    navigation.navigate('edit-activity-log', { activityLogId });
  };

  const renderActionOptions = () => {
    let options: any;
    switch (activityLog?.status) {
      case ActivityLogStatus.PENDING:
        options = {
          actionLabel: t('general:delete'),
          onActionButtonClick: onDeleteLogBtnPress,
          buttonType: ButtonType.DANGER,
          loading: isLoadingActivityLog || isCancelingLog,
        };
        break;
    }
    return options;
  };

  return (
    <ModalLayout
      title={t('title')}
      onDismiss={navigation.goBack}
      actionsOptions={renderActionOptions()}
      onEditButtonPress={
        activityLog?.status === ActivityLogStatus.PENDING ? onEditActivityLog : undefined
      }
    >
      {isLoadingActivityLog && <ActivityLogSkeleton />}
      {activityLog && !isLoadingActivityLog && (
        <>
          {activityLog?.status === ActivityLogStatus.PENDING && (
            <Disclaimer
              color={ActivityLogStatusToColorMapper[activityLog?.status]}
              text={`${t('disclaimer.pending')}`}
            />
          )}
          {activityLog?.status === ActivityLogStatus.APPROVED && (
            <Disclaimer
              color={ActivityLogStatusToColorMapper[activityLog?.status]}
              text={`${t('disclaimer.approved', { date: activityLog.approvedOn })}`}
            />
          )}
          {activityLog?.status === ActivityLogStatus.REJECTED && (
            <Disclaimer
              color={ActivityLogStatusToColorMapper[activityLog?.status]}
              text={`${t('disclaimer.rejected', { date: activityLog.rejectedOn })}`}
            />
          )}
          <FormLayout>
            <OrganizationIdentity
              uri={activityLog.organization.logo || ''}
              name={activityLog.organization.name}
            />
            <ReadOnlyElement label={t('form.event.label')} value={activityLog?.event?.name} />
            <ReadOnlyElement
              label={t('form.task.label')}
              value={activityLog?.activityType?.name || `${t('other')}`}
            />
            <ReadOnlyElement label={t('form.date.label')} value={activityLog?.date} />
            <ReadOnlyElement label={t('form.hours.label')} value={`${activityLog?.hours}`} />
            <ReadOnlyElement label={t('form.mentions.label')} value={activityLog?.mentions} />
            {activityLog.status === ActivityLogStatus.REJECTED && (
              <>
                <Divider />
                <ReadOnlyElement
                  label={t('rejection_reason')}
                  value={activityLog.rejectionReason}
                />
              </>
            )}
          </FormLayout>
        </>
      )}
    </ModalLayout>
  );
};

export default ActivityLog;
