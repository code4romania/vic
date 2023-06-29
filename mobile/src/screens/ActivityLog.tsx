import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import FormLayout from '../layouts/FormLayout';
import {
  useActivityLogQuery,
  useCancelActivityLogMutation,
} from '../services/activity-log/activity-log.service';
import LoadingScreen from '../components/LoadingScreen';
import Disclaimer from '../components/Disclaimer';
import { ActivityLogStatusToColorMapper } from '../common/utils/utils';
import { useTranslation } from 'react-i18next';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ButtonType } from '../common/enums/button-type.enum';
import { Divider } from '@ui-kitten/components';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useAuth } from '../hooks/useAuth';

const ActivityLog = ({ navigation, route }: any) => {
  console.log('ActivityLog');
  // translations
  const { t } = useTranslation('activity_log');

  const { userProfile } = useAuth();

  const { activityLogId } = route.params;
  // activity log query
  const { isFetching: isLoadingActivityLog, data: activityLog } =
    useActivityLogQuery(activityLogId);
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
      {isLoadingActivityLog && <LoadingScreen />}
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
            {userProfile?.activeOrganization && (
              <OrganizationIdentity
                uri={userProfile?.activeOrganization.logo || ''}
                name={userProfile?.activeOrganization.name}
              />
            )}
            <ReadOnlyElement
              label={i18n.t('activity_log:form.event.label')}
              value={activityLog?.event?.name}
            />
            <ReadOnlyElement
              label={i18n.t('activity_log:form.task.label')}
              value={activityLog?.activityType.name}
            />
            <ReadOnlyElement
              label={i18n.t('activity_log:form.date.label')}
              value={activityLog?.date}
            />
            <ReadOnlyElement
              label={i18n.t('activity_log:form.hours.label')}
              value={`${activityLog?.hours}`}
            />
            <ReadOnlyElement
              label={i18n.t('activity_log:form.mentions.label')}
              value={activityLog?.mentions}
            />
            {activityLog.status === ActivityLogStatus.REJECTED && (
              <>
                <Divider />
                <ReadOnlyElement
                  label={i18n.t('activity_log:rejection_reason')}
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
