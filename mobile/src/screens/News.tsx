import React from 'react';
import { BackIcon } from '../layouts/PageLayout';
import NewsListItem from '../components/NewsListItem';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import { View, StyleSheet } from 'react-native';
import { useNewsInfiniteQuery } from '../services/news/news.service';
import { INewsItem } from '../common/interfaces/news-item.interface';
import { useTranslation } from 'react-i18next';
import { NewsType } from '../common/enums/news-type.enum';
import { ActivityLogStatus } from '../common/enums/activity-log.status.enum';
import { TrackedEventName } from '../common/enums/tracked-event-name.enum';
import { Text, TopNavigation, TopNavigationAction, useTheme } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import NewsItemSkeleton from '../components/skeleton/news-item.skeleton';
import { useUserProfile } from '../store/profile/profile.selector';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';
import useStore from '../store/store';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';
import { Screen } from '../components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NewsContent = ({
  startText,
  endText,
  organizationName,
}: {
  startText: string;
  endText?: string;
  organizationName?: string;
}) => {
  const theme = useTheme();
  return (
    <Text
      allowFontScaling={ALLOW_FONT_SCALLING}
      category="c1"
      numberOfLines={2}
      ellipsizeMode="tail"
      style={{ ...styles.newsText, color: theme['cool-gray-500'] }}
    >
      {startText}{' '}
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="s1" style={styles.newsText}>
        {organizationName || ''}
      </Text>{' '}
      {endText || ''}
    </Text>
  );
};
const News = ({ navigation, route }: any) => {
  const { type } = route.params;
  const { t } = useTranslation('news');
  const insets = useSafeAreaInsets();

  // switch organization
  const { mutate: switchOrganization } = useSwitchOrganizationMutation();

  const { setActiveOrganization } = useStore();
  const { userProfile } = useUserProfile();

  const {
    data: news,
    error: getNewsError,
    isFetching: isFetchingNews,
    fetchNextPage,
    hasNextPage,
    refetch: reloadNews,
    isFetchingNextPage,
  } = useNewsInfiniteQuery(type);

  const onLoadMore = () => {
    if (!isFetchingNews && hasNextPage) {
      fetchNextPage();
    }
  };

  const onRenderAnouncementListItem = ({ item }: { item: INewsItem }) => (
    <View style={styles.listItemContainer}>
      <NewsListItem
        icon={item.organizationLogo}
        subtitleElement={renderNewsItemDescription(item)}
        onPress={onNewsItemPress.bind(null, item)}
      />
    </View>
  );

  const renderHeader = () => {
    switch (type) {
      case NewsType.CONTRACTS:
        return t('header.documents');
      case NewsType.LOGGED_HOURS:
        return t('header.logs');
      case NewsType.ORGANIZATIONS:
        return t('header.organizations');
    }

    return '';
  };

  const renderNewsItemDescription = (item: INewsItem) => {
    switch (type) {
      case NewsType.CONTRACTS:
        return renderDocumentsNewsItemDescription(item);
      case NewsType.LOGGED_HOURS:
        return renderActivityLogsNewsItemDescription(item);
      case NewsType.ORGANIZATIONS:
        return renderOrganizationsNewsItemDescription(item);
    }
  };

  const renderActivityLogsNewsItemDescription = (item: INewsItem) => {
    if (
      item.newStatus === ActivityLogStatus.APPROVED &&
      item.eventName === TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS
    ) {
      return <NewsContent startText={t('item.logs.approved')} />;
    }

    if (
      item.newStatus === ActivityLogStatus.REJECTED &&
      item.eventName === TrackedEventName.CHANGE_ACTIVITY_LOG_STATUS
    ) {
      return <NewsContent startText={t('item.logs.rejected')} />;
    }

    return <></>;
  };

  const renderDocumentsNewsItemDescription = (item: INewsItem) => {
    if (item.eventName === TrackedEventName.CREATE_CONTRACT) {
      return (
        <NewsContent
          startText={''}
          endText={`${t('item.documents.new')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.APPROVE_CONTRACT) {
      return (
        <NewsContent
          startText={`${t('item.documents.approved_start')}`}
          endText={`${t('item.documents.approved_end')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.REJECT_CONTRACT) {
      return (
        <NewsContent
          startText={`${t('item.documents.rejected_start')}`}
          endText={`${t('item.documents.rejected_end')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.CREATE_DOCUMENT_CONTRACT) {
      return (
        <NewsContent
          startText={''}
          organizationName={item.organizationName}
          endText={`${t('item.documents.new')}`}
        />
      );
    }

    if (item.eventName === TrackedEventName.VALIDATE_DOCUMENT_CONTRACT) {
      return (
        <NewsContent
          startText={`${t('item.documents.validated_start')}`}
          organizationName={item.organizationName}
          endText={`${t('item.documents.validated_end')}`}
        />
      );
    }

    if (item.eventName === TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_NGO) {
      return (
        <NewsContent
          startText={`${t('item.documents.signed_start')}`}
          organizationName={item.organizationName}
          endText={`${t('item.documents.signed_end')}`}
        />
      );
    }

    if (item.eventName === TrackedEventName.SIGN_DOCUMENT_CONTRACT_BY_VOLUNTEER) {
      return (
        <NewsContent
          startText={`${t('item.documents.signed_volunteer_start')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_NGO) {
      return (
        <NewsContent
          startText={`${t('item.documents.rejected_start')}`}
          organizationName={item.organizationName}
          endText={`${t('item.documents.rejected_end')}`}
        />
      );
    }

    if (item.eventName === TrackedEventName.REJECT_DOCUMENT_CONTRACT_BY_VOLUNTEER) {
      return (
        <NewsContent
          startText={`${t('item.documents.rejected_volunteer_start')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.DELETE_DOCUMENT_CONTRACT) {
      return (
        <NewsContent
          startText={`${t('item.documents.deleted_start')}`}
          organizationName={item.organizationName}
          endText={`${t('item.documents.deleted_end')}`}
        />
      );
    }

    return <></>;
  };

  const renderOrganizationsNewsItemDescription = (item: INewsItem) => {
    if (item.eventName === TrackedEventName.APPROVE_ACCESS_REQUEST) {
      return (
        <NewsContent
          startText={`${t('item.organization.request')}`}
          endText={`${t('item.organization.approved')}`}
          organizationName={item.organizationName}
        />
      );
    }

    if (item.eventName === TrackedEventName.REJECT_ACCESS_REQUEST) {
      return (
        <NewsContent
          startText={`${t('item.organization.request')}`}
          endText={`${t('item.organization.rejected')}`}
          organizationName={item.organizationName}
        />
      );
    }

    return <></>;
  };

  const onNewsItemPress = (item: INewsItem) => {
    if (userProfile?.activeOrganization?.id !== item.organizationId) {
      const activeOrganization = userProfile?.myOrganizations.find(
        (org) => org.id === item.organizationId,
      );

      if (activeOrganization) {
        setActiveOrganization(activeOrganization as IOrganizationVolunteer);
      }
      switchOrganization({ organizationId: item.organizationId as string });

      if (type === NewsType.LOGGED_HOURS) {
        navigation.navigate('activity-log', { activityLogId: item.activityLogId });
      }

      if (type === NewsType.CONTRACTS) {
        // don't navigate to contract if it was deleted
        if (item.eventName === TrackedEventName.DELETE_DOCUMENT_CONTRACT) {
          return;
        }
        navigation.navigate('documents/contract', { contractId: item.contractId });
      }

      if (type === NewsType.ORGANIZATIONS) {
        if (item.eventName === TrackedEventName.REJECT_ACCESS_REQUEST) {
          navigation.navigate('rejected-request', { accessRequestId: item.accessRequestId });
        } else {
          navigation.navigate('organization-profile', { organizationId: item.organizationId });
        }
      }
    } else {
      if (type === NewsType.LOGGED_HOURS) {
        navigation.navigate('activity-log', { activityLogId: item.activityLogId });
      }

      if (type === NewsType.CONTRACTS) {
        // don't navigate to contract if it was deleted
        if (item.eventName === TrackedEventName.DELETE_DOCUMENT_CONTRACT) {
          return;
        }
        navigation.navigate('documents/contract', { contractId: item.contractId });
      }

      if (type === NewsType.ORGANIZATIONS) {
        if (item.eventName === TrackedEventName.REJECT_ACCESS_REQUEST) {
          navigation.navigate('rejected-request', { accessRequestId: item.accessRequestId });
        } else {
          navigation.navigate('organization-profile', { organizationId: item.organizationId });
        }
      }
    }
  };

  const renderLeftControl = () => {
    return <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />;
  };

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[styles.innerContainer, { paddingTop: insets.top }]}
    >
      <TopNavigation
        title={renderHeader()}
        alignment="start"
        accessoryLeft={renderLeftControl}
        style={styles.header}
      />
      <InfiniteListLayout<INewsItem>
        pages={news?.pages}
        renderItem={onRenderAnouncementListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingNews && !isFetchingNextPage}
        refetch={reloadNews}
        loadingLayout={<NewsItemSkeleton />}
        hasDivider={false}
        errorMessage={getNewsError ? `${t('errors.generic')}` : ''}
      />
    </Screen>
  );
};

export default News;

const styles = StyleSheet.create({
  innerContainer: { flex: 1, padding: 16 },
  header: {
    minHeight: 59,
    marginLeft: -16,
  },
  listItemContainer: {
    paddingBottom: 16,
    paddingHorizontal: 2,
  },
  newsText: {
    paddingRight: 32,
    lineHeight: 20,
  },
});
