import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer, DrawerItem, Text } from '@ui-kitten/components';
import Tabs from './Tabs';
import { Image, View } from 'react-native';
import i18n from '../common/config/i18n';
import { withStyles } from '@ui-kitten/components';
//SVG
import { SvgXml } from 'react-native-svg';
import PlusSvg from '../assets/svg/plus';
import { LiteralUnion } from '@ui-kitten/components/devsupport';

const { Navigator, Screen } = createDrawerNavigator();

const AccessoryImage = () => {
  return (
    <Image
      source={{ uri: 'https://picsum.photos/200/300' }}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        width: 40,
        height: 40,
        borderRadius: 40,
      }}
    />
  );
};

const AccesoryAdd = withStyles(
  ({ eva }: { eva?: any }) => {
    return (
      <View style={eva?.style.svgWrapper}>
        <SvgXml xml={PlusSvg} />
      </View>
    );
  },
  (theme) => ({
    svgWrapper: {
      width: 40,
      height: 40,
      borderRadius: 40,
      backgroundColor: theme['color-success-active'],
      justifyContent: 'center',
      alignItems: 'center',
    },
  }),
);

interface DrawerItemComponentProps {
  children: string;
  eva?: any;
  category?: LiteralUnion<
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 's1' | 's2' | 'p1' | 'p2' | 'c1' | 'c2' | 'label'
  >;
}

const DrawerHeader = withStyles(
  ({ children, eva }: DrawerItemComponentProps) => (
    <Text category="h3" style={eva?.style.drawerHeader}>
      {children}
    </Text>
  ),
  (theme) => ({
    drawerHeader: {
      backgroundColor: theme['drawer-background'],
      color: theme['turquoise-300'],
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 8,
    },
  }),
);

const DrawerItemTitle = withStyles(
  ({ children, eva, category }: DrawerItemComponentProps) => (
    <Text category={category || 'h3'} style={eva?.style.drawerItemTitle}>
      {children}
    </Text>
  ),
  () => ({
    drawerItemTitle: {
      color: '#fff',
    },
  }),
);

const DrawerContent = withStyles(
  // ({ navigation, state, eva }: any) => {
  ({ navigation, eva }: any) => {
    const isItemActive = () => {
      return eva?.style.activeDrawerItem;
    };

    const renderAccessoryLeft = () => <AccesoryAdd />;
    const renderDrawerHeader = () => (
      <DrawerHeader>{`${i18n.t('volunteer:my_organizations')}`}</DrawerHeader>
    );

    return (
      <View style={eva?.style.drawerContainer}>
        <Drawer
          // onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
          style={eva?.style.drawer}
          appearance="noDivider"
          header={renderDrawerHeader}
        >
          <DrawerItem
            title={<DrawerItemTitle>{'Users'}</DrawerItemTitle>}
            accessoryLeft={AccessoryImage}
            style={[eva?.style.drawerItem]}
          />
          <DrawerItem
            title={<DrawerItemTitle>{'Orders'}</DrawerItemTitle>}
            accessoryLeft={AccessoryImage}
            style={[eva?.style.drawerItem, isItemActive()]}
          />
          <DrawerItem
            title={<DrawerItemTitle>{'Code4Romania'}</DrawerItemTitle>}
            accessoryLeft={AccessoryImage}
            style={[eva?.style.drawerItem]}
          />
          <DrawerItem
            title={
              <DrawerItemTitle category="s1">{`${i18n.t(
                'volunteer:join_organization',
              )}`}</DrawerItemTitle>
            }
            accessoryLeft={renderAccessoryLeft}
            style={[eva?.style.drawerItem]}
            onPress={() => {
              navigation.navigate('join-organization');
              navigation.closeDrawer();
            }}
          />
        </Drawer>
      </View>
    );
  },
  (theme) => ({
    drawer: {
      backgroundColor: theme['drawer-background'],
      borderBottomRightRadius: 40,
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
  }),
);

const renderDrawerContent = (props: any) => <DrawerContent {...props} />;

export const DrawerNavigator = () => (
  <Navigator
    drawerContent={renderDrawerContent}
    initialRouteName="tabs"
    screenOptions={{ headerShown: false, drawerType: 'front', swipeEnabled: false }}
  >
    <Screen name="tabs" component={Tabs} />
  </Navigator>
);

export default DrawerNavigator;
