import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
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
          <Text category="p2" numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text category="c1" appearance="hint">
            {`${t('volunteers', { number: item.numberOfVolunteers })}`}
          </Text>
        </View>
      </View>
    </PressableContainer>
  );
};

const Organizations = ({ navigation }: any) => {
  console.log('Organizations');
  const { t } = useTranslation('organizations');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>(OrderDirection.ASC);
  const [search, setSearch] = useState<string>('');

  // organizations query
  const {
    data: organizations,
    error: getOrganizationsError,
    isFetching: isFetchingOrganizations,
    fetchNextPage,
    hasNextPage,
    refetch: reloadOrganizations,
  } = useOrganizationsInfiniteQuery(orderDirection, search);

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
    <PageLayout title={t('title')}>
      <SearchWithOrderAndFilters
        placeholder={t('search.placeholder')}
        onChange={setSearch}
        onSort={onSort}
      />
      <InfiniteListLayout<IOrganizationListItemWithNumberOfVolunteers>
        pages={organizations?.pages}
        renderItem={onRenderOrganizationListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingOrganizations}
        refetch={reloadOrganizations}
        loadingLayout={<OrganizationSkeletonListItem />}
        errorMessage={getOrganizationsError ? `${t('errors.generic')}` : ''}
      />
    </PageLayout>
  );
};

export default Organizations;

const themedStyles = StyleService.create({
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
