import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button as ButtonKitten, Icon, Text, useTheme } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import Tabs from '../components/Tabs';
import { StyleSheet, View } from 'react-native';
import {
  useActivityLogsCounters,
  useActivityLogsInfiniteQuery,
} from '../services/activity-log/activity-log.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { useTranslation } from 'react-i18next';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import LogItem from '../components/LogItem';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ISelectItem } from '../components/FormSelect';
import Button from '../components/Button';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useUserProfile } from '../store/profile/profile.selector';
import ActivityLogSkeletonItem from '../components/skeleton/activity-log-skeleton-item';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

import { renderBackdrop } from '../components/BottomSheet';
import { useReducedMotion } from 'react-native-reanimated';
import BottomSheet from '@gorhom/bottom-sheet';
import upsIcon from '../assets/svg/ups-icon';
import { SvgXml } from 'react-native-svg';
import Paragraph from '../components/Paragraph';
import InlineLink from '../components/InlineLink';

export const ActivityLogsTabs: ISelectItem[] = [
  { key: ActivityLogStatus.PENDING, label: i18n.t('activity_logs:tabs.pending') },
  { key: ActivityLogStatus.APPROVED, label: i18n.t('activity_logs:tabs.approved') },
  { key: ActivityLogStatus.REJECTED, label: i18n.t('activity_logs:tabs.rejected') },
];

const ActivityLogs = ({ navigation }: any) => {
  const theme = useTheme();
  // translations
  const { t } = useTranslation('activity_logs');
  // order direction filter
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  // search filter
  const [search, setSearch] = useState<string>('');
  // active tab
  const [status, setStatus] = useState<ActivityLogStatus>(ActivityLogStatus.PENDING);
  // counters state
  const { approvedHours, rejectedHours, pendingHours, activityLog } = useActivityLogs();
  // user profile
  const { userProfile } = useUserProfile();
  // bottom sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  // bottom sheet snap points
  const snapPoints = useMemo(() => [1, 410], []);
  const reducedMotion = useReducedMotion();

  // events query
  const {
    data: activityLogs,
    error: getActivityLogsError,
    isFetching: isFetchingActivityLogs,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: reloadActivityLogs,
  } = useActivityLogsInfiniteQuery(orderDirection, search, status);

  // counters
  const { refetch: reloadCounters } = useActivityLogsCounters(
    status,
    userProfile?.activeOrganization?.volunteerId as string,
  );

  // This will be triggered every time the organization state changes
  const refetchLogs = useCallback(() => {
    if (activityLog) {
      reloadActivityLogs();
      reloadCounters();
    }
  }, [reloadCounters, reloadActivityLogs, activityLog]);

  useEffect(() => {
    refetchLogs();
  }, [refetchLogs, activityLog]);

  const onAddActivityLogButtonPress = () => {
    // if we don't have a volunteer profile -> open error bottom sheet
    if (!userProfile?.activeOrganization?.volunteerProfileId) {
      bottomSheetRef.current?.expand();
    } else {
      navigation.navigate('add-activity-log');
    }
  };

  const onTabPress = (activeTab: string | number) => {
    setStatus(activeTab as ActivityLogStatus);
  };

  const onLoadMore = () => {
    if (!isFetchingActivityLogs && hasNextPage) {
      fetchNextPage();
    }
  };

  const onSort = () => {
    setOrderDirection(
      orderDirection === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC,
    );
  };

  const onActivityLogItemPress = (activityLogId: string) => {
    navigation.navigate('activity-log', { activityLogId });
  };

  const onRenderEventListItem = ({ item }: { item: IActivityLogItem }) => (
    <LogItem activityLog={item} onPress={onActivityLogItemPress} />
  );

  const onCloseBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  const onGoToIdentityDataScreen = () => {
    onCloseBottomSheet();
    navigation.navigate('volunteer-profile');
  };

  return (
    <>
      <PageLayout title={t('title')} onBackButtonPress={navigation.goBack}>
        {userProfile?.activeOrganization && (
          <View style={styles.organizationIdentityWrapper}>
            <OrganizationIdentity
              uri={userProfile?.activeOrganization.logo || ''}
              name={userProfile?.activeOrganization.name}
            />
          </View>
        )}
        <Tabs tabs={ActivityLogsTabs} onPress={onTabPress} />
        <SearchWithOrderAndFilters
          placeholder={t('search.placeholder')}
          onChange={setSearch}
          onSort={onSort}
        />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint" style={styles.totalText}>
          {`${t('activity_log:total')}`}{' '}
          <>
            {status === ActivityLogStatus.APPROVED && (
              <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">
                {`${approvedHours || '0'}h`}{' '}
              </Text>
            )}
            {status === ActivityLogStatus.REJECTED && (
              <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">
                {`${rejectedHours || '0'}h`}{' '}
              </Text>
            )}
            {status === ActivityLogStatus.PENDING && (
              <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p2">
                {`${pendingHours || '0'}h`}{' '}
              </Text>
            )}
          </>
        </Text>
        <InfiniteListLayout<IActivityLogItem>
          pages={activityLogs?.pages}
          renderItem={onRenderEventListItem}
          loadMore={onLoadMore}
          isLoading={isFetchingActivityLogs && !isFetchingNextPage}
          refetch={reloadActivityLogs}
          loadingLayout={<ActivityLogSkeletonItem />}
          errorMessage={getActivityLogsError ? `${t('errors.generic')}` : ''}
        />
        <ButtonKitten onPress={onAddActivityLogButtonPress} style={styles.addButton}>
          {() => (
            <Icon name="plus" style={{ ...styles.addIcon, color: theme['color-basic-100'] }} />
          )}
        </ButtonKitten>
      </PageLayout>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        animateOnMount={reducedMotion ? false : true}
      >
        <View style={styles.container}>
          <SvgXml xml={upsIcon} height={100} width={100} />
          <View style={styles.textContainer}>
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h1">
              {`${t('error_modal.title')}`}
            </Text>
            <Paragraph style={styles.bottomSheetParagraph}>
              {`${t('error_modal.description')}`}
            </Paragraph>
          </View>
          <View style={styles.buttonsContainer}>
            <Button
              label={`${t('error_modal.action_btn_label')}`}
              status={'primary'}
              onPress={onGoToIdentityDataScreen}
            />
            <InlineLink
              label={t('general:back')}
              style={{ color: theme['cool-gray-700'] }}
              onPress={onCloseBottomSheet}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default ActivityLogs;

const styles = StyleSheet.create({
  totalText: {
    textAlign: 'right',
    paddingTop: 16,
    paddingBottom: 8,
  },
  organizationIdentityWrapper: {
    marginBottom: 21,
  },
  addButton: {
    position: 'absolute',
    right: 21,
    bottom: 21,
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  addIcon: {
    height: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  textContainer: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomSheetParagraph: {
    textAlign: 'center',
  },
  buttonsContainer: {
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
