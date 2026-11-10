import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
  useActivityLogQuery,
  useCancelActivityLogMutation,
} from '../services/activity-log/activity-log.service';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { colors, fonts, radius, shadows, spacing } from '../common/theme/tokens';
import { formatLogLongDay } from '../common/utils/activity-log-format';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import ActivityLogSkeleton from '../components/skeleton/activity-log-skeleton';
import { EventIcon } from '../components/events/EventIcons';
import { LOG_STATUS_TONE } from '../components/hours/LogRow';
import { ToastHost } from '../common/config/toast';
import {
  EmptyState,
  Enter,
  PressableScale,
  Sheet,
  StatusBarScrim,
  VButton,
  VText,
} from '../components/ui';

/**
 * VIC 2.0 hours entry (canvas board "OraDetaliu"): the hours in a tile, the task, a status note
 * (the reason when it was refused) and the facts. A pending entry can still be edited or deleted.
 */
const ActivityLog = ({ navigation, route }: any) => {
  const { t } = useTranslation(['activity_log', 'general']);
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const deleteSheet = useRef<BottomSheetModal>(null);
  const { activityLogId } = route.params;

  const { activityLog } = useActivityLogs();
  const { isFetching, error: loadError, refetch } = useActivityLogQuery(activityLogId);
  const notFound = (loadError as any)?.response?.status === 404;
  // the delete invalidates the list and the totals
  const { isLoading: isDeleting, mutate: cancelLog } = useCancelActivityLogMutation();

  const log = activityLog && activityLog.id === activityLogId ? activityLog : undefined;
  const isPending = log?.status === ActivityLogStatus.PENDING;
  const title = log?.activityType?.name || `${t('other')}`;

  const onDelete = () => {
    deleteSheet.current?.dismiss();
    cancelLog(
      { activityLogId },
      {
        onSuccess: () => {
          navigation.goBack();
          Toast.show({ type: 'success', text1: `${t('toast.success')}` });
        },
        onError: (error: any) =>
          Toast.show({
            type: 'error',
            text1: `${InternalErrors.ACTIVITY_LOG_ERRORS.getError(
              error.response?.data.code_error,
            )}`,
          }),
      },
    );
  };

  const onEdit = () => navigation.navigate('edit-activity-log', { activityLogId });

  const note = () => {
    if (!log) {
      return null;
    }
    const tone = colors.status[LOG_STATUS_TONE[log.status]];
    switch (log.status) {
      case ActivityLogStatus.PENDING:
        return { tone, text: `${t('disclaimer.pending_editable')}` };
      case ActivityLogStatus.APPROVED:
        return {
          tone,
          // older entries may have no approval date
          text: log.approvedOn
            ? `${t('disclaimer.approved', { date: formatLogLongDay(log.approvedOn) })}`
            : `${t('disclaimer.approved_undated')}`,
        };
      case ActivityLogStatus.REJECTED:
        return {
          tone,
          text: log.rejectedOn
            ? `${t('disclaimer.rejected', { date: formatLogLongDay(log.rejectedOn) })}`
            : `${t('disclaimer.rejected_undated')}`,
          reason: log.rejectionReason,
        };
      default:
        return null;
    }
  };

  const facts = log
    ? [
        { key: 'event', label: t('form.event.label'), value: log.event?.name || '–' },
        { key: 'task', label: t('form.task.label'), value: title },
        { key: 'date', label: t('form.date.label'), value: formatLogLongDay(log.date) },
        { key: 'hours', label: t('form.hours.label'), value: `${log.hours}h` },
      ]
    : [];
  const statusNote = note();

  return (
    // On iOS this screen is a native modal: the app-level sheet provider renders behind it, so the
    // delete confirmation needs a provider of its own to show on top (#591).
    <BottomSheetModalProvider>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + (isPending ? 120 : 40) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <PressableScale
              onPress={navigation.goBack}
              style={[styles.back, shadows.back]}
              accessibilityLabel={`${t('general:back')}`}
              testID="log-back"
            >
              <EventIcon name="back" size={20} />
            </PressableScale>
          </View>

          {!log && isFetching && <ActivityLogSkeleton />}

          {!log && !isFetching && !!loadError && (
            // deleted in the meantime (404) or the request failed: say so instead of a blank page
            <EmptyState
              title={`${notFound ? t('errors.not_found') : t('errors.generic')}`}
              error={!notFound}
              actionLabel={notFound ? undefined : `${t('events:retry')}`}
              onAction={notFound ? undefined : () => refetch()}
              testID="log-error"
            />
          )}

          {log && (
            <>
              <Enter style={styles.tile}>
                <VText style={styles.tileText}>{`${log.hours}h`}</VText>
              </Enter>
              <Enter index={1}>
                <VText variant="largeTitle" style={styles.title} accessibilityRole="header">
                  {title}
                </VText>
                <VText variant="sub">{log.organization?.name}</VText>
              </Enter>

              {statusNote && (
                <Enter
                  index={2}
                  style={[styles.note, { backgroundColor: statusNote.tone.bg }]}
                  testID="log-status"
                >
                  <VText variant="label" color={statusNote.tone.fg}>
                    {statusNote.text}
                  </VText>
                  {!!statusNote.reason && (
                    <VText variant="body" color={statusNote.tone.fg}>
                      <VText variant="bodyStrong" color={statusNote.tone.fg}>
                        {`${t('rejection_reason')}: `}
                      </VText>
                      {statusNote.reason}
                    </VText>
                  )}
                </Enter>
              )}

              <Enter index={3}>
                {facts.map((fact) => (
                  <View key={fact.key} style={styles.fact}>
                    <VText variant="sub">{fact.label}</VText>
                    <VText variant="bodyStrong" style={styles.factValue}>
                      {fact.value}
                    </VText>
                  </View>
                ))}
                {!!log.mentions && (
                  <View style={styles.mentions}>
                    <VText variant="sub">{t('form.mentions.label')}</VText>
                    <VText variant="body">{log.mentions}</VText>
                  </View>
                )}
              </Enter>
            </>
          )}
        </ScrollView>
        <StatusBarScrim color={colors.white} />

        {isPending && (
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <VButton
              variant="soft"
              label={`${t('general:delete')}`}
              onPress={() => deleteSheet.current?.present()}
              loading={isDeleting}
              style={styles.fill}
              testID="log-delete"
            />
            <VButton
              label={`${t('general:edit', { item: '' }).trim()}`}
              onPress={onEdit}
              style={styles.fill}
              testID="log-edit"
            />
          </View>
        )}

        <Sheet
          ref={deleteSheet}
          title={`${t('confirmation_modal.heading')}`}
          subtitle={
            log ? `${t('confirmation_modal.description', { hours: log.hours, title })}` : ''
          }
          testID="log-delete-sheet"
        >
          <VButton
            variant="danger"
            label={`${t('general:delete')}`}
            onPress={onDelete}
            testID="log-delete-confirm"
          />
          <VButton
            variant="soft"
            label={`${t('general:cancel')}`}
            onPress={() => deleteSheet.current?.dismiss()}
          />
        </Sheet>
        {/* iOS modal: the app-level toasts would be hidden behind it */}
        <ToastHost />
      </View>
    </BottomSheetModalProvider>
  );
};

export default ActivityLog;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.gutter },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  tileText: { fontFamily: fonts.title, fontSize: 24, lineHeight: 30, color: colors.navy },
  title: { marginTop: 14, fontSize: 28, lineHeight: 34 },
  note: { borderRadius: radius.button, padding: 14, gap: 6, marginTop: 14 },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  factValue: { flexShrink: 1, textAlign: 'right' },
  mentions: { paddingVertical: 14, gap: 6 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    flexDirection: 'row',
    gap: 12,
  },
  fill: { flex: 1 },
});
