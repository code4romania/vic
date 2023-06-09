import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Icon, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import Tabs from '../components/Tabs';
import { View } from 'react-native';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import {
  useActivityLogsCounters,
  useActivityLogsInfiniteQuery,
} from '../services/activity-log/activity-log.service';
import { OrderDirection } from '../common/enums/order-direction.enum';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { useTranslation } from 'react-i18next';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { JSONStringifyError } from '../common/utils/utils';
import { IActivityLogItem } from '../common/interfaces/activity-log-item.interface';
import LogItem from '../components/LogItem';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { ISelectItem } from '../components/FormSelect';
import { useActivityLogs } from '../store/activity-log/activity-log.selectors';

export const ActivityLogsTabs: ISelectItem[] = [
  { key: ActivityLogStatus.PENDING, label: i18n.t('activity_logs:tabs.pending') },
  { key: ActivityLogStatus.APPROVED, label: i18n.t('activity_logs:tabs.approved') },
  { key: ActivityLogStatus.REJECTED, label: i18n.t('activity_logs:tabs.rejected') },
];

const ActivityLogs = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  console.log('ActivityLogs');
  // translations
  const { t } = useTranslation('activity_logs');
  // order direction filter
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  // search filter
  const [search, setSearch] = useState<string>('');
  // active tab
  const [status, setStatus] = useState<ActivityLogStatus>(ActivityLogStatus.PENDING);
  // active organization
  const { activeOrganization } = useActiveOrganization();
  // counters state
  const { approvedHours, rejectedHours, pendingHours } = useActivityLogs();

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
  const { isFetching: isLoadingCounters } = useActivityLogsCounters(
    status,
    activeOrganization?.volunteerId as string,
  ); // TODO: check for error

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

  const onEventListItemPress = (eventId: string) => {
    navigation.navigate('event', { eventId });
  };

  const onRenderEventListItem = ({ item }: { item: IActivityLogItem }) => (
    <LogItem activityLog={item} onPress={onEventListItemPress} />
  );

  return (
    <PageLayout title={t('title')} onBackButtonPress={navigation.goBack}>
      {activeOrganization && (
        <View style={styles.organizationIdentityWrapper}>
          <OrganizationIdentity
            uri={activeOrganization.logo || ''}
            name={activeOrganization.name}
          />
        </View>
      )}
      <Tabs tabs={ActivityLogsTabs} onPress={onTabPress} />
      <SearchWithOrderAndFilters
        placeholder={t('search.placeholder')}
        onChange={setSearch}
        onSort={onSort}
      />
      {!isLoadingCounters && (
        <Text appearance="hint" style={styles.totalText}>
          {`${i18n.t('activity_log:total')}`}{' '}
          <>
            {status === ActivityLogStatus.APPROVED && (
              <Text category="p2">{`${approvedHours}h`} </Text>
            )}
            {status === ActivityLogStatus.REJECTED && (
              <Text category="p2">{`${rejectedHours}h`} </Text>
            )}
            {status === ActivityLogStatus.PENDING && (
              <Text category="p2">{`${pendingHours}h`} </Text>
            )}
          </>
        </Text>
      )}
      <InfiniteListLayout<IActivityLogItem>
        pages={activityLogs?.pages}
        renderItem={onRenderEventListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingActivityLogs}
        refetch={reloadActivityLogs}
        errorMessage={
          getActivityLogsError
            ? `${JSONStringifyError(getActivityLogsError as Error)}`
            : // : `${t('errors.generic')}`
              ''
        }
      />
      <Button onPress={onAddActivityLogButtonPress} style={styles.addButton}>
        {() => <Icon name="plus" style={styles.addIcon} />}
      </Button>
    </PageLayout>
  );
};

export default ActivityLogs;

const themedStyles = StyleService.create({
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
    color: '$color-basic-100',
  },
});
