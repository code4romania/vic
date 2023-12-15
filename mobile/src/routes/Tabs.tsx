import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon, Text, useTheme } from '@ui-kitten/components';
import Home from '../screens/Home';
import Events from '../screens/Events';
import Organizations from '../screens/Organizations';
import Settings from '../screens/Settings';
import Volunteer from '../screens/Volunteer';
import i18n from '../common/config/i18n';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

const { Navigator, Screen } = createBottomTabNavigator();

const Title = ({ title, active }: { title: string; active?: boolean }) => {
  const theme = useTheme();
  return (
    <Text
      category="c1"
      style={[active ? { color: theme['color-primary-500'] } : {}, styles.title]}
      allowFontScaling={ALLOW_FONT_SCALLING}
    >
      {title}
    </Text>
  );
};

const HomeIcon = (props: any) => <Icon {...props} style={[props.style, styles.icon]} name="home" />;
const SunIcon = (props: any) => <Icon {...props} style={[props.style, styles.icon]} name="sun" />;
const CalendarIcon = (props: any) => (
  <Icon {...props} style={[props.style, styles.icon]} name="calendar" />
);
const SearchIcon = (props: any) => (
  <Icon {...props} style={[props.style, styles.icon]} name="search" />
);
const SettingsIcon = (props: any) => (
  <Icon {...props} style={[props.style, styles.icon]} name="settings" />
);

const BottomTabBar = ({ navigation, state }: any) => {
  const onSelect = (index: number) => navigation.navigate(state.routeNames[index]);

  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={onSelect}
      appearance="noIndicator"
      style={[styles.tabs]}
    >
      <BottomNavigationTab
        title={<Title title={`${i18n.t('tabs:home')}`} active={state.index === 0} />}
        icon={HomeIcon}
      />
      <BottomNavigationTab
        title={<Title title={`${i18n.t('tabs:volunteer')}`} active={state.index === 1} />}
        icon={SunIcon}
      />
      <BottomNavigationTab
        title={<Title title={`${i18n.t('tabs:events')}`} active={state.index === 2} />}
        icon={CalendarIcon}
      />
      <BottomNavigationTab
        title={<Title title={`${i18n.t('tabs:search')}`} active={state.index === 3} />}
        icon={SearchIcon}
      />
      <BottomNavigationTab
        title={<Title title={`${i18n.t('tabs:account_settings')}`} active={state.index === 4} />}
        icon={SettingsIcon}
      />
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
  title: { paddingTop: 4 },
  icon: { height: 24, width: 24 },
});
