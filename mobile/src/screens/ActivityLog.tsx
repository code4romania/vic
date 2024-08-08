import React, { useMemo, useRef } from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import ReadOnlyElement from '../components/ReadOnlyElement';
import FormLayout from '../layouts/FormLayout';
import {
  useActivityLogQuery,
  useActivityLogsCounters,
  useActivityLogsInfiniteQuery,
  useCancelActivityLogMutation,
} from '../services/activity-log/activity-log.service';
import Disclaimer from '../components/Disclaimer';
import { ActivityLogStatusToColorMapper } from '../common/utils/utils';
import { useTranslation } from 'react-i18next';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ButtonType } from '../common/enums/button-type.enum';
import { Divider, Text } from '@ui-kitten/components';
import Toast from 'react-native-toast-message';
import { InternalErrors } from '../common/errors/internal-errors.class';
import ActivityLogSkeleton from '../components/skeleton/activity-log-skeleton';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import BottomSheet from '@gorhom/bottom-sheet';
import { useReducedMotion } from 'react-native-reanimated';
import { renderBackdrop } from '../components/BottomSheet';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { SvgXml } from 'react-native-svg';
import upsIcon from '../assets/svg/ups-icon';
import Button from '../components/Button';

const ActivityLog = ({ navigation, route }: any) => {
  // translations
  const { t } = useTranslation(['activity_log', 'general']);
  const insets = useSafeAreaInsets();
  const { activityLogId, orderDirection, search, status, volunteerId } = route.params;
  // activity log query
  const { activityLog } = useActivityLogs();

  const { isFetching: isLoadingActivityLog } = useActivityLogQuery(activityLogId);
  // cancel activity log
  const { isLoading: isCancelingLog, mutate: cancelLog } = useCancelActivityLogMutation();

  const { refetch: reloadCounters } = useActivityLogsCounters(status, volunteerId);
  const { refetch: reloadActivityLogs } = useActivityLogsInfiniteQuery(
    orderDirection,
    search,
    status,
  );

  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 350], []);

  const reducedMotion = useReducedMotion();

  const openBottomSheet = () => {
    return bottomSheetRef.current?.expand();
  };

  const onCloseBottomSheet = () => {
    return bottomSheetRef.current?.close();
  };

  const onDeleteLogBtnPress = () => {
    onCloseBottomSheet();
    cancelLog(
      { activityLogId },
      {
        onSuccess: () => {
          // reload logs and counters
          reloadActivityLogs();
          reloadCounters();
          navigation.goBack();
          Toast.show({ type: 'success', text1: `${t('toast.success')}` });
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
          onActionButtonClick: openBottomSheet,
          buttonType: ButtonType.DANGER,
          loading: isLoadingActivityLog || isCancelingLog,
        };
        break;
    }
    return options;
  };

  return (
    <>
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
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={[styles.bottomSheetContainer, { paddingBottom: insets.bottom }]}>
          <SvgXml xml={upsIcon} height={100} width={100} />
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h2" style={styles.text}>
            {`${t('confirmation_modal.paragraph')}`}
          </Text>
          <Button
            status="danger"
            label={t('delete', { ns: 'general' })}
            onPress={onDeleteLogBtnPress}
            loading={isCancelingLog}
          />
        </View>
      </BottomSheet>
    </>
  );
};

export default ActivityLog;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  text: {
    textAlign: 'center',
  },
});
