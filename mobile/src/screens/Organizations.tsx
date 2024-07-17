import React, { useCallback, useEffect, useState } from 'react';
import { Text, Avatar, useStyleSheet, StyleService } from '@ui-kitten/components';
import { ImageStyle, View } from 'react-native';
import { useOrganizationsInfiniteQuery } from '../services/organization/organization.service';
import { IOrganizationListItemWithNumberOfVolunteers } from '../common/interfaces/organization-list-item.interface';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useTranslation } from 'react-i18next';
import PressableContainer from '../components/PressableContainer';
import OrganizationSkeletonListItem from '../components/skeleton/organization-sekelton-item';
import { useOrganization } from '../store/organization/organization.selector';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { Screen } from '../components/Screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OrganizationItemProps {
  item: IOrganizationListItemWithNumberOfVolunteers;
  onClick: () => void;
}

const OrganizationListItem = ({ item, onClick }: OrganizationItemProps) => {
  const { t } = useTranslation('organization_profile');

  const styles = useStyleSheet(themedStyles);

  return (
    <PressableContainer onPress={onClick}>
      <View style={styles.renderItem}>
        <Avatar source={{ uri: item.logo }} size="large" style={styles.avatar as ImageStyle} />
        <View style={styles.textWrapper}>
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="p2"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1" appearance="hint">
            {`${t('volunteers', { number: item.numberOfVolunteers })}`}
          </Text>
        </View>
      </View>
    </PressableContainer>
  );
};

const Organizations = ({ navigation }: any) => {
  const { t } = useTranslation('organizations');
  const insets = useSafeAreaInsets();

  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  const [search, setSearch] = useState<string>('');
  // organization state
  const { organization } = useOrganization();
  // user profile
  const { userProfile } = useUserProfile();

  // organizations query
  const {
    data: organizations,
    error: getOrganizationsError,
    isFetching: isFetchingOrganizations,
    fetchNextPage,
    hasNextPage,
    refetch: reloadOrganizations,
    isFetchingNextPage,
  } = useOrganizationsInfiniteQuery(orderDirection, search);

  // This will be triggered every time the organization state changes
  const refetchOrganizations = useCallback(() => {
    reloadOrganizations();
  }, [reloadOrganizations]);

  useEffect(() => {
    refetchOrganizations();
  }, [organization, refetchOrganizations, userProfile]);

  const onViewOrganizationProfileButtonPress = (organizationId: string) => {
    navigation.navigate('organization-profile', { organizationId });
  };

  const onLoadMore = () => {
    if (!isFetchingOrganizations && hasNextPage) {
      fetchNextPage();
    }
  };

  const onSort = () => {
    setOrderDirection(
      orderDirection === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC,
    );
  };

  const onRenderOrganizationListItem = ({
    item,
  }: {
    item: IOrganizationListItemWithNumberOfVolunteers;
  }) => (
    <OrganizationListItem
      item={item}
      onClick={onViewOrganizationProfileButtonPress.bind(null, item.id)}
    />
  );

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={[themedStyles.childrenContainer, { paddingTop: insets.top + 16 }]}
    >
      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={themedStyles.title}>
        {`${t('title')}`}
      </Text>
      <SearchWithOrderAndFilters
        placeholder={t('search.placeholder')}
        onChange={setSearch}
        onSort={onSort}
      />
      <InfiniteListLayout<IOrganizationListItemWithNumberOfVolunteers>
        pages={organizations?.pages}
        renderItem={onRenderOrganizationListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingOrganizations && !isFetchingNextPage}
        refetch={reloadOrganizations}
        loadingLayout={<OrganizationSkeletonListItem />}
        errorMessage={getOrganizationsError ? `${t('errors.generic')}` : ''}
      />
    </Screen>
  );
};

export default Organizations;

const themedStyles = StyleService.create({
  childrenContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: { paddingLeft: 8, marginBottom: 16 },
  avatar: { borderWidth: 1, borderColor: '$cool-gray-200' },
  textWrapper: {
    gap: 4,
    flexShrink: 2,
  },
  renderItem: {
    gap: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
