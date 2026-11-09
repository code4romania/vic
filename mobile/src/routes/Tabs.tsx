import React from 'react';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Events from '../screens/Events';
import ActivityLogs from '../screens/ActivityLogs';
import Documents from '../screens/Documents';
import Settings from '../screens/Settings';
import Volunteer from '../screens/Volunteer';
import Organizations from '../screens/Organizations';
import i18n from '../common/config/i18n';
import GlassTabBar, { GlassTabBarItem } from '../components/navigation/GlassTabBar';
import { TabBarScrollProvider } from '../components/navigation/TabBarScroll';
import { HIDDEN_TAB_ROUTES, TAB_ROUTES } from './tab-routes';

const { Navigator, Screen } = createBottomTabNavigator();

// VIC 2.0 tabs (approved redesign): Acasă, Evenimente, Ore, Documente, Profil.
// "Voluntar" (the volunteer's page at an organization) and "Caută" (organizations) stay routes of
// this navigator, so navigate('volunteer') / navigate('search') keep
// working, but they have no button in the bar: they are reached from Profil.
const items = (): Record<string, GlassTabBarItem> => ({
  [TAB_ROUTES.HOME]: { icon: 'home', label: i18n.t('tabs:home') },
  [TAB_ROUTES.EVENTS]: { icon: 'events', label: i18n.t('tabs:events') },
  [TAB_ROUTES.HOURS]: { icon: 'hours', label: i18n.t('tabs:hours') },
  [TAB_ROUTES.DOCUMENTS]: { icon: 'documents', label: i18n.t('tabs:documents') },
  [TAB_ROUTES.PROFILE]: { icon: 'profile', label: i18n.t('tabs:profile') },
});

// Every tab screen is VIC 2.0: it scrolls under the glass bar and adds the bar inset itself.
const renderTabBar = (props: BottomTabBarProps) => <GlassTabBar {...props} items={items()} />;

const Tabs = () => (
  <TabBarScrollProvider>
    <Navigator
      screenOptions={{ headerShown: false, lazy: true }}
      backBehavior="history"
      tabBar={renderTabBar}
    >
      <Screen name={TAB_ROUTES.HOME} component={Home} />
      <Screen name={TAB_ROUTES.EVENTS} component={Events} />
      <Screen name={TAB_ROUTES.HOURS} component={ActivityLogs} />
      <Screen name={TAB_ROUTES.DOCUMENTS} component={Documents} />
      <Screen name={TAB_ROUTES.PROFILE} component={Settings} />
      <Screen name={HIDDEN_TAB_ROUTES.VOLUNTEER} component={Volunteer} />
      <Screen name={HIDDEN_TAB_ROUTES.ORGANIZATIONS} component={Organizations} />
    </Navigator>
  </TabBarScrollProvider>
);

export default Tabs;
