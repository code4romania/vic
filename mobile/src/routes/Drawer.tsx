import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Drawer, DrawerItem, Text, useTheme } from '@ui-kitten/components';
import Tabs from './Tabs';
import { Image, View } from 'react-native';
import { withStyles } from '@ui-kitten/components';
//SVG
import { SvgXml } from 'react-native-svg';
import PlusSvg from '../assets/svg/plus';
import { LiteralUnion } from '@ui-kitten/components/devsupport';
import { useSwitchOrganizationMutation } from '../services/organization/organization.service';
import { IOrganizationVolunteer } from '../common/interfaces/organization-list-item.interface';
import { useTranslation } from 'react-i18next';
import useStore from '../store/store';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

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
      backgroundColor: theme['cool-gray-600'],
      justifyContent: 'center',
      alignItems: 'center',
    },
  }),
);

interface DrawerItemComponentProps {
  children: string;
  eva?: any;
  active?: boolean;
  category?: LiteralUnion<
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 's1' | 's2' | 'p1' | 'p2' | 'c1' | 'c2' | 'label'
  >;
}

const DrawerHeader = withStyles(
  ({ children, eva }: DrawerItemComponentProps) => (
    <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={eva?.style.drawerHeader}>
      {children}
    </Text>
  ),
  (theme) => ({
    drawerHeader: {
      backgroundColor: theme['cool-gray-800'],
      color: theme['color-basic-100'],
      paddingHorizontal: 18,
      paddingTop: 24,
      paddingBottom: 8,
    },
  }),
);

const DrawerItemTitle = withStyles(
  ({ children, eva, active, category }: DrawerItemComponentProps) => {
    const theme = useTheme();
    return (
      <Text
        allowFontScaling={ALLOW_FONT_SCALLING}
        category={category || 'h3'}
        lineBreakMode="tail"
        style={{
          ...eva?.style.drawerItemTitle,
          color: active ? theme['color-primary-500'] : theme['color-basic-100'],
        }}
      >
        {children}
      </Text>
    );
  },
  () => ({
    drawerItemTitle: {
      flexWrap: 'wrap',
      paddingLeft: 16,
      maxWidth: '80%',
    },
  }),
);

const DrawerContent = withStyles(
  ({ navigation, eva }: any) => {
    const { t } = useTranslation('volunteer');

    const { setActiveOrganization } = useStore();
    const { userProfile } = useUserProfile();
    // switch organization
    const { mutate: switchOrganization } = useSwitchOrganizationMutation();

    // add accessory
    const renderAccessoryLeft = () => <AccesoryAdd />;

    // drawer header
    const renderDrawerHeader = () => <DrawerHeader>{`${t('my_organizations')}`}</DrawerHeader>;

    const renderAccessroyLeft = (logo: string) => {
      return <AccessoryImage logo={logo} />;
    };

    const onOrganizationChange = (organization: IOrganizationVolunteer) => {
      setActiveOrganization(organization);
      navigation.closeDrawer();
      switchOrganization({ organizationId: organization.id });
    };

    const onJoinNewOrganization = () => {
      navigation.navigate('search');
      navigation.closeDrawer();
    };

    return (
      <View style={eva?.style.drawerContainer}>
        <Drawer style={eva?.style.drawer} appearance="noDivider" header={renderDrawerHeader}>
          <>
            {userProfile?.myOrganizations?.map((organization: IOrganizationVolunteer) => (
              <DrawerItem
                key={organization.id}
                title={
                  <DrawerItemTitle active={userProfile.activeOrganization?.id === organization.id}>
                    {organization.name}
                  </DrawerItemTitle>
                }
                accessoryLeft={renderAccessroyLeft.bind(null, organization.logo || '')}
                onPress={onOrganizationChange.bind(null, organization)}
                style={[
                  eva?.style.drawerItem,
                  ...(userProfile.activeOrganization?.id === organization.id
                    ? [eva?.style.activeDrawerItem]
                    : []),
                ]}
              />
            ))}
            <DrawerItem
              title={<DrawerItemTitle category="s1">{`${t('join_organization')}`}</DrawerItemTitle>}
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
      backgroundColor: theme['cool-gray-800'],
      borderBottomRightRadius: 40,
    },
    drawerItem: {
      marginTop: 16,
      marginHorizontal: 18,
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 8,
      justifyContent: 'flex-start',
    },
    activeDrawerItem: {
      backgroundColor: theme['cool-gray-700'],
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

const DrawerNavigator = () => (
  <Navigator
    drawerContent={renderDrawerContent}
    initialRouteName="tabs"
    screenOptions={{ headerShown: false, drawerType: 'front', swipeEnabled: false }}
  >
    <Screen name="tabs" component={Tabs} />
  </Navigator>
);

export default DrawerNavigator;
