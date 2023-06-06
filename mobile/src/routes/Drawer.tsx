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
import { useOrganizations } from '../store/organization/organizations.selector';
import {
  useMyOrganizationsQuery,
  useSwitchOrganizationMutation,
} from '../services/organization/organization.service';
import { useActiveOrganization } from '../store/organization/active-organization.selector';
import useStore from '../store/store';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';

const AccessoryImage = withStyles(
  ({ logo, eva }: { logo?: string; eva?: any }) => {
    return <Image source={{ uri: logo }} style={eva?.style.image} />;
  },
  () => ({
    image: {
      width: 40,
      height: 40,
      borderRadius: 40,
    },
  }),
);

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
    // Get my organizations
    const { error } = useMyOrganizationsQuery();
    console.log('organizations query', error);

    // organizations state
    const { organizations } = useOrganizations();
    console.log('organizations', organizations);
    // active organizatio state
    const { activeOrganization } = useActiveOrganization();
    // update active organization
    const { setActiveOrganization } = useStore();
    // switch organization
    const { mutate: switchOrganization } = useSwitchOrganizationMutation();

    // add accessory
    const renderAccessoryLeft = () => <AccesoryAdd />;

    // drawer header
    const renderDrawerHeader = () => (
      <DrawerHeader>{`${i18n.t('volunteer:my_organizations')}`}</DrawerHeader>
    );

    const renderAccessroyLeft = (logo: string) => {
      return <AccessoryImage logo={logo} />;
    };

    const onOrganizationChange = (organization: IOrganizationVolunteer) => {
      switchOrganization({ organizationId: organization.id });
      setActiveOrganization(organization);
      navigation.closeDrawer();
    };

    const onJoinNewOrganization = () => {
      navigation.navigate('search');
      navigation.closeDrawer();
    };

    return (
      <View style={eva?.style.drawerContainer}>
        <Drawer style={eva?.style.drawer} appearance="noDivider" header={renderDrawerHeader}>
          <>
            {organizations.map((organization: IOrganizationVolunteer) => (
              <DrawerItem
                key={organization.id}
                title={<DrawerItemTitle>{organization.name}</DrawerItemTitle>}
                accessoryLeft={renderAccessroyLeft.bind(null, organization.logo || '')}
                onPress={onOrganizationChange.bind(null, organization)}
                style={[
                  eva?.style.drawerItem,
                  ...(activeOrganization?.id === organization.id
                    ? [eva?.style.activeDrawerItem]
                    : []),
                ]}
              />
            ))}
            <DrawerItem
              title={
                <DrawerItemTitle category="s1">{`${i18n.t(
                  'volunteer:join_organization',
                )}`}</DrawerItemTitle>
              }
              accessoryLeft={renderAccessoryLeft}
              style={[eva?.style.drawerItem]}
              onPress={onJoinNewOrganization}
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

// create drawer navigator on top of the tabs
const { Navigator, Screen } = createDrawerNavigator();

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
