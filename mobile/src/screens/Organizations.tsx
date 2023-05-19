import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, List, Avatar, Divider, useStyleSheet, StyleService } from '@ui-kitten/components';
import { ImageStyle, Pressable, View } from 'react-native';
import i18n from '../common/config/i18n';

const organizations = [
  { logo: 'https://picsum.photos/200', name: 'Asociatia ZEN', volunteers: 1200 },
  { logo: 'https://picsum.photos/200', name: 'Green City', volunteers: 60 },
  { logo: 'https://picsum.photos/200', name: 'Code4Romania', volunteers: 2003 },
  { logo: 'https://picsum.photos/200', name: 'UNICEF', volunteers: 20 },
  { logo: 'https://picsum.photos/200', name: 'EESTEC Bucuresti', volunteers: 121 },
  { logo: 'https://picsum.photos/200', name: 'Habitat for Humanity', volunteers: 12211212 },
];

const Organizations = ({ navigation }: any) => {
  console.log('Organizations');
  const styles = useStyleSheet(themedStyles);

  const onViewOrganizationProfileButtonPress = () => {
    navigation.navigate('organization-profile');
  };

  const renderItem = ({ item }: { item: { logo: string; name: string; volunteers: number } }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#d9d9d9' : 'white',
          },
        ]}
        onPress={onViewOrganizationProfileButtonPress}
      >
        <View style={styles.renderItem}>
          <Avatar source={{ uri: item.logo }} size="large" style={styles.avatar as ImageStyle} />
          <View style={styles.textWrapper}>
            <Text category="p2">{item.name}</Text>
            <Text category="c1" appearance="hint">
              {`${i18n.t('organization_profile:volunteers', { number: item.volunteers })}`}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <PageLayout title={i18n.t('general:organizations')}>
      <List
        data={organizations}
        renderItem={renderItem}
        style={styles.list}
        ItemSeparatorComponent={Divider}
      />
    </PageLayout>
  );
};

export default Organizations;

const themedStyles = StyleService.create({
  list: {
    backgroundColor: '$text-control-color',
  },
  avatar: { borderWidth: 1, borderColor: '$cool-gray-200' },
  textWrapper: {
    gap: 4,
  },
  renderItem: {
    gap: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
