import React, { useState } from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, Avatar, useStyleSheet, StyleService, useTheme } from '@ui-kitten/components';
import { ImageStyle, Pressable, View } from 'react-native';
import i18n from '../common/config/i18n';
import { useOrganizations } from '../services/organization/organization.service';
import { IOrganizationListItem } from '../common/interfaces/organization-list-item.interface';
import InfiniteListLayout from '../layouts/InfiniteListLayout';
import SearchWithOrderAndFilters from '../components/SearchWithOrderAndFilters';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { useTranslation } from 'react-i18next';
import { JSONStringifyError } from '../common/utils/utils';

interface OrganizationItemProps {
  item: IOrganizationListItem;
  onClick: () => void;
}

const OrganizationListItem = ({ item, onClick }: OrganizationItemProps) => {
  const styles = useStyleSheet(themedStyles);
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? theme['cool-gray-50'] : 'white',
        },
      ]}
      onPress={onClick}
    >
      <View style={styles.renderItem}>
        <Avatar source={{ uri: item.logo }} size="large" style={styles.avatar as ImageStyle} />
        <View style={styles.textWrapper}>
          <Text category="p2" numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text category="c1" appearance="hint">
            {`${i18n.t('organization_profile:volunteers', { number: item.numberOfVolunteers })}`}
          </Text>
        </View>
      </View>
    </Pressable>
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
  } = useOrganizations(orderDirection, search);

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

  const onRenderOrganizationListItem = ({ item }: { item: IOrganizationListItem }) => (
    <OrganizationListItem
      item={item}
      onClick={onViewOrganizationProfileButtonPress.bind(null, item.id)}
    />
  );

  return (
    <PageLayout title={i18n.t('general:organizations')}>
      <SearchWithOrderAndFilters
        placeholder={t('search.placeholder')}
        onChange={setSearch}
        onSort={onSort}
        onFilter={() => console.log('filter')}
      />
      <InfiniteListLayout<IOrganizationListItem>
        pages={organizations?.pages}
        renderItem={onRenderOrganizationListItem}
        loadMore={onLoadMore}
        isLoading={isFetchingOrganizations}
        refetch={reloadOrganizations}
        errorMessage={
          getOrganizationsError
            ? `${JSONStringifyError(getOrganizationsError as Error)}`
            : // : `${t('errors.generic')}`
              ''
        }
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
