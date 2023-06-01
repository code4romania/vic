import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer, DrawerItem, Text } from '@ui-kitten/components';
import Tabs from './Tabs';
// import { Image, View } from 'react-native';
import { View } from 'react-native';
import i18n from '../common/config/i18n';
import { withStyles } from '@ui-kitten/components';
//SVG
import { SvgXml } from 'react-native-svg';
import PlusSvg from '../assets/svg/plus';
import { LiteralUnion } from '@ui-kitten/components/devsupport';
import { useMyOrganizationsQuery } from '../services/organization/organization.service';
// import { IOrganizationMenuItem } from '../common/interfaces/organization-menu-item.interface';

const { Navigator, Screen } = createDrawerNavigator();

// const AccessoryImage = ({ logo }: { logo: string }) => {
//   return (
//     <Image
//       source={{ uri: logo }}
//       // eslint-disable-next-line react-native/no-inline-styles
//       style={{
//         width: 40,
//         height: 40,
//         borderRadius: 40,
//       }}
//     />
//   );
// };

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
  ({ navigation, eva }: any) => {
    // ToDo: handle error
    const { data: organizations } = useMyOrganizationsQuery();
    console.log('organizations', organizations);

    // add accessory
    const renderAccessoryLeft = () => <AccesoryAdd />;

    // drawer header
    const renderDrawerHeader = () => (
      <DrawerHeader>{`${i18n.t('volunteer:my_organizations')}`}</DrawerHeader>
    );

    // const renderAccessroyLeft = (logo: string) => {
    //   return <AccessoryImage logo={logo} />;
    // };

    return (
      <View style={eva?.style.drawerContainer}>
        <Drawer style={eva?.style.drawer} appearance="noDivider" header={renderDrawerHeader}>
          <>
            {/* {[]?.map((organization: IOrganizationMenuItem) => (
              <DrawerItem
                key={organization.id}
                title={<DrawerItemTitle>{organization.name}</DrawerItemTitle>}
                accessoryLeft={renderAccessroyLeft.bind(null, organization.logo || '')}
                style={[eva?.style.drawerItem]}
              />
            ))} */}
            <DrawerItem
              title={
                <DrawerItemTitle category="s1">{`${i18n.t(
                  'volunteer:join_organization',
                )}`}</DrawerItemTitle>
              }
              accessoryLeft={renderAccessoryLeft}
              style={[eva?.style.drawerItem]}
              onPress={() => {
                navigation.navigate('search');
                navigation.closeDrawer();
              }}
            />
          </>
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
