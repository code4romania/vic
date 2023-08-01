import React, { useCallback, useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Icon, Text, useTheme } from '@ui-kitten/components';
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
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';
import { useUserProfile } from '../store/profile/profile.selector';
import ActivityLogSkeletonItem from '../components/skeleton/activity-log-skeleton-item';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

export const ActivityLogsTabs: ISelectItem[] = [
  { key: ActivityLogStatus.PENDING, label: i18n.t('activity_logs:tabs.pending') },
  { key: ActivityLogStatus.APPROVED, label: i18n.t('activity_logs:tabs.approved') },
  { key: ActivityLogStatus.REJECTED, label: i18n.t('activity_logs:tabs.rejected') },
];

const ActivityLogs = ({ navigation }: any) => {
  console.log('ActivityLogs');
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

  // events query
  const {
    data: activityLogs,
    error: getActivityLogsError,
    isFetching: isFetchingActivityLogs,
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
    navigation.navigate('add-activity-log');
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

  return (
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
        isLoading={isFetchingActivityLogs}
        refetch={reloadActivityLogs}
        loadingLayout={<ActivityLogSkeletonItem />}
        errorMessage={getActivityLogsError ? `${t('errors.generic')}` : ''}
      />
      <Button onPress={onAddActivityLogButtonPress} style={styles.addButton}>
        {() => <Icon name="plus" style={{ ...styles.addIcon, color: theme['color-basic-100'] }} />}
      </Button>
    </PageLayout>
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
});
