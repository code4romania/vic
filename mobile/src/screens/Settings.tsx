import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Image, View, TouchableHighlight, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SETTING_SCREENS } from '../common/constants/setting-screens';
import { SETTINGS_ROUTES } from '../common/enums/setting-routes';
import { Text, Divider, List } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

interface IListItem {
  icon: string;
  label: string;
  route: string;
}

const Settings = ({ navigation }: any) => {
  const { t } = useTranslation('settings');

  const handleItemPress = (route: string) => {
    if (route === SETTINGS_ROUTES.INFORMATION) {
      console.log('navigate to url');
    } else if (route === SETTINGS_ROUTES.LOGOUT) {
      console.log('log out');
    } else {
      navigation.navigate(route);
    }
  };

  const renderItem = ({ item }: { item: IListItem }) => (
    <TouchableHighlight
      onPress={() => handleItemPress(item.route)}
      activeOpacity={1}
      underlayColor="#F9F9F9"
    >
      <View style={styles.screen}>
        <View style={styles.iconWrapper}>
          <SvgXml xml={item.icon} />
        </View>
        <Text category="label" appearance="hint">
          {item.label}
        </Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <PageLayout title={t('title')}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: 'https://picsum.photos/200/300' }} style={styles.image} />
          <Text category="h2" appearance="hint">
            Andreea Popa
          </Text>
        </View>
        <List
          data={SETTING_SCREENS}
          ItemSeparatorComponent={Divider}
          renderItem={renderItem}
          style={styles.list}
        />
      </View>
    </PageLayout>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  list: {
    backgroundColor: 'white',
  },
  image: { width: 48, height: 48, borderRadius: 100 },
  profileContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  screen: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
