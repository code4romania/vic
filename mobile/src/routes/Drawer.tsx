import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer, DrawerItem, IndexPath } from '@ui-kitten/components';
import Tabs from './Tabs';

const { Navigator, Screen } = createDrawerNavigator();

const DrawerContent = ({ navigation, state }: any) => (
  <Drawer
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
  >
    <DrawerItem title="Users" />
    <DrawerItem title="Orders" />
  </Drawer>
);

export const DrawerNavigator = () => (
  <Navigator
    drawerContent={DrawerContent}
    initialRouteName="tabs"
    screenOptions={{ headerShown: false, drawerType: 'front' }}
  >
    <Screen name="tabs" component={Tabs} />
  </Navigator>
);

export default DrawerNavigator;
