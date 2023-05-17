import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import Home from '../screens/Home';
import Events from '../screens/Events';
import Organizations from '../screens/Organizations';
import Settings from '../screens/Settings';
import Volunteer from '../screens/Volunteer';
import i18n from '../common/config/i18n';

const { Navigator, Screen } = createBottomTabNavigator();

const HomeIcon = (props: any) => <Icon {...props} name="home" />;
const SunIcon = (props: any) => <Icon {...props} name="sun" />;
const CalendarIcon = (props: any) => <Icon {...props} name="calendar" />;
const SearchIcon = (props: any) => <Icon {...props} name="search" />;
const SettingsIcon = (props: any) => <Icon {...props} name="settings" />;

const BottomTabBar = ({ navigation, state }: any) => {
  const onSelect = (index: number) => navigation.navigate(state.routeNames[index]);

  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={onSelect}
      appearance="noIndicator"
      style={styles.tabs}
    >
      <BottomNavigationTab title={`${i18n.t('tabs:home')}`} icon={HomeIcon} />
      <BottomNavigationTab title={`${i18n.t('tabs:volunteer')}`} icon={SunIcon} />
      <BottomNavigationTab title={`${i18n.t('tabs:events')}`} icon={CalendarIcon} />
      <BottomNavigationTab title={`${i18n.t('tabs:search')}`} icon={SearchIcon} />
      <BottomNavigationTab title={`${i18n.t('tabs:account_settings')}`} icon={SettingsIcon} />
    </BottomNavigation>
  );
};

const HomeComponent = (props: any) => <Home {...props} name="Acasa" />;
const VolunteerComponent = (props: any) => <Volunteer {...props} name="Voluntar" />;
const EventsComponent = (props: any) => <Events {...props} name="Evenimente" />;
const SearchComponent = (props: any) => <Organizations {...props} name="Cauta" />;
const SettingsComponent = (props: any) => <Settings {...props} name="Setari cont" />;

const Tabs = () => (
  <Navigator screenOptions={{ headerShown: false, lazy: true }} tabBar={BottomTabBar}>
    <Screen name="dashboard" component={HomeComponent} />
    <Screen name="volunteer" component={VolunteerComponent} />
    <Screen name="events" component={EventsComponent} />
    <Screen name="search" component={SearchComponent} />
    <Screen name="settings" component={SettingsComponent} />
  </Navigator>
);

export default Tabs;

const styles = StyleSheet.create({
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: { borderTopColor: '#EDF1F7', borderTopWidth: 1 },
});
