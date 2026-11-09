import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Events from '../screens/Events';
import ActivityLogs from '../screens/ActivityLogs';
import Documents from '../screens/Documents';
import Settings from '../screens/Settings';
import Volunteer from '../screens/Volunteer';
import Organizations from '../screens/Organizations';
import i18n from '../common/config/i18n';
import { colors } from '../common/theme/tokens';
import GlassTabBar, {
  GlassTabBarItem,
  useGlassTabBarInset,
} from '../components/navigation/GlassTabBar';
import { TabBarScrollProvider } from '../components/navigation/TabBarScroll';
import { HIDDEN_TAB_ROUTES, TAB_ROUTES } from './tab-routes';

const { Navigator, Screen } = createBottomTabNavigator();

// VIC 2.0 tabs (approved redesign): Acasă, Evenimente, Ore, Documente, Profil.
// "Voluntar" (the volunteer's page at an organization) and "Caută" (organizations) stay routes of
// this navigator, so navigate('volunteer') / navigate('search') and the organization drawer keep
// working, but they have no button in the bar: they are reached from Profil and Acasă.
const items = (): Record<string, GlassTabBarItem> => ({
  [TAB_ROUTES.HOME]: { icon: 'home', label: i18n.t('tabs:home') },
  [TAB_ROUTES.EVENTS]: { icon: 'events', label: i18n.t('tabs:events') },
  [TAB_ROUTES.HOURS]: { icon: 'hours', label: i18n.t('tabs:hours') },
  [TAB_ROUTES.DOCUMENTS]: { icon: 'documents', label: i18n.t('tabs:documents') },
  [TAB_ROUTES.PROFILE]: { icon: 'profile', label: i18n.t('tabs:profile') },
});

/**
 * Keeps the bottom of a screen that is not redesigned yet clear of the floating bar. Redesigned
 * screens scroll under the glass and add the inset to their own content instead.
 */
const withTabInset = (Component: React.ComponentType<any>) => {
  const Wrapped = (props: any) => {
    const inset = useGlassTabBarInset();
    return (
      <View style={[styles.scene, { paddingBottom: inset }]}>
        <Component {...props} />
      </View>
    );
  };
  Wrapped.displayName = `withTabInset(${Component.displayName || Component.name})`;
  return Wrapped;
};

const HomeTab = withTabInset(Home);
// redesigned: scrolls under the glass bar and adds the inset itself
const EventsTab = Events;
const HoursTab = withTabInset(ActivityLogs);
const DocumentsTab = withTabInset(Documents);
const ProfileTab = withTabInset(Settings);
const VolunteerRoute = withTabInset(Volunteer);
// Organizations pads its own list under the glass tab bar
const OrganizationsRoute = Organizations;

const renderTabBar = (props: BottomTabBarProps) => <GlassTabBar {...props} items={items()} />;

const Tabs = () => (
  <TabBarScrollProvider>
    <Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      backBehavior="history"
      tabBar={renderTabBar}
    >
      <Screen name={TAB_ROUTES.HOME} component={HomeTab} />
      <Screen name={TAB_ROUTES.EVENTS} component={EventsTab} />
      <Screen name={TAB_ROUTES.HOURS} component={HoursTab} />
      <Screen name={TAB_ROUTES.DOCUMENTS} component={DocumentsTab} />
      <Screen name={TAB_ROUTES.PROFILE} component={ProfileTab} />
      <Screen name={HIDDEN_TAB_ROUTES.VOLUNTEER} component={VolunteerRoute} />
      <Screen name={HIDDEN_TAB_ROUTES.ORGANIZATIONS} component={OrganizationsRoute} />
    </Navigator>
  </TabBarScrollProvider>
);

export default Tabs;

const styles = StyleSheet.create({
  scene: { flex: 1, backgroundColor: colors.white },
});
