import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer, DrawerItem, Text } from '@ui-kitten/components';
import Tabs from './Tabs';
import { Image, StyleSheet, View } from 'react-native';
import OrganizationProfile from '../screens/OrganizationProfile';
import i18n from '../common/config/i18n';
//SVG
import { SvgXml } from 'react-native-svg';
import PlusSvg from '../assets/svg/plus';

const { Navigator, Screen } = createDrawerNavigator();

const AccessoryImage = () => {
  return <Image source={{ uri: 'https://picsum.photos/200/300' }} style={styles.drawerImage} />;
};

const AccesoryAdd = () => {
  return (
    <View style={styles.svgWrapper}>
      <SvgXml xml={PlusSvg} />
    </View>
  );
};

const DrawerHeader = () => {
  return (
    <Text category="h3" style={styles.drawerHeader}>{`${i18n.t('general:my_organizations')}`}</Text>
  );
};

const DrawerItemTitle = ({ title }: { title: string }) => {
  return (
    <Text category="h2" style={styles.drawerItemTitle}>
      {title}
    </Text>
  );
};
const AddDrawerItemTitle = () => {
  return (
    <Text category="s1" style={styles.drawerItemTitle}>
      {`${i18n.t('general:join_organization')}`}
    </Text>
  );
};

const DrawerContent = ({ navigation, state }: any) => {
  const isItemActive = () => {
    return styles.activeDrawerItem;
  };

  return (
    <View style={styles.drawerContainer}>
      <Drawer
        onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
        style={styles.drawer}
        appearance="noDivider"
        header={DrawerHeader}
      >
        <DrawerItem
          title={<DrawerItemTitle title="Users" />}
          accessoryLeft={AccessoryImage}
          style={[styles.drawerItem]}
        />
        <DrawerItem
          title={<DrawerItemTitle title="Orders" />}
          accessoryLeft={AccessoryImage}
          style={[styles.drawerItem, isItemActive()]}
        />
        <DrawerItem
          title={<DrawerItemTitle title="Asociatia ZEN" />}
          accessoryLeft={AccessoryImage}
          style={[styles.drawerItem]}
        />
        <DrawerItem
          title={<AddDrawerItemTitle />}
          accessoryLeft={AccesoryAdd}
          style={[styles.drawerItem]}
        />
      </Drawer>
    </View>
  );
};

export const DrawerNavigator = () => (
  <Navigator
    drawerContent={DrawerContent}
    initialRouteName="tabs"
    screenOptions={{ headerShown: false, drawerType: 'front', swipeEnabled: false }}
  >
    <Screen name="tabs" component={Tabs} />
    <Screen name="organization-profile" component={OrganizationProfile} />
  </Navigator>
);

export default DrawerNavigator;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#09636B',
    borderBottomRightRadius: 40,
  },
  drawerHeader: {
    backgroundColor: '#09636B',
    color: '#A7E2E2',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 8,
  },
  drawerImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  drawerItem: {
    marginTop: 16,
    marginHorizontal: 18,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 8,
    justifyContent: 'flex-start',
    gap: 16,
  },
  activeDrawerItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    marginHorizontal: 10,
    borderRadius: 50,
    paddingHorizontal: 8,
  },
  drawerContainer: {
    backgroundColor: 'grey',
    flex: 1,
  },
  drawerItemTitle: {
    color: '#fff',
  },
  svgWrapper: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#2E8D8E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
