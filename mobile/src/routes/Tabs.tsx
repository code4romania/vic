import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Layout, BottomNavigation, BottomNavigationTab, Text, Icon } from '@ui-kitten/components';

const { Navigator, Screen } = createBottomTabNavigator();

const TestScreen = (props: any) => {
  console.log('render', props.name);

  useEffect(() => {
    console.log('on init');
  }, []);

  return (
    <Layout style={styles.screenContainer}>
      <Text category="h1">{props.name}</Text>
    </Layout>
  );
};

const HomeIcon = (props: any) => <Icon {...props} name="home" />;
const SunIcon = (props: any) => <Icon {...props} name="sun" />;
const CalendarIcon = (props: any) => <Icon {...props} name="calendar" />;
const SearchIcon = (props: any) => <Icon {...props} name="search" />;
const SettingsIcon = (props: any) => <Icon {...props} name="settings-2" />;

const BottomTabBar = ({ navigation, state }: any) => {
  const onSelect = (index: number) => navigation.navigate(state.routeNames[index]);

  return (
    <BottomNavigation
      selectedIndex={state.index}
      onSelect={onSelect}
      appearance="noIndicator"
      style={styles.tabs}
    >
      <BottomNavigationTab title="Acasa" icon={HomeIcon} />
      <BottomNavigationTab title="Voluntar" icon={SunIcon} />
      <BottomNavigationTab title="Evenimente" icon={CalendarIcon} />
      <BottomNavigationTab title="Cauta" icon={SearchIcon} />
      <BottomNavigationTab title="Setari cont" icon={SettingsIcon} />
    </BottomNavigation>
  );
};

const Home = (props: any) => <TestScreen {...props} name="Acasa" />;
const Volunteer = (props: any) => <TestScreen {...props} name="Voluntar" />;
const Events = (props: any) => <TestScreen {...props} name="Evenimente" />;
const Search = (props: any) => <TestScreen {...props} name="Cauta" />;
const Settings = (props: any) => <TestScreen {...props} name="Setari cont" />;

const TabNavigator = () => (
  <Navigator screenOptions={{ headerShown: false, lazy: true }} tabBar={BottomTabBar}>
    <Screen name="home" component={Home} />
    <Screen name="volunteer" component={Volunteer} />
    <Screen name="events" component={Events} />
    <Screen name="search" component={Search} />
    <Screen name="settings" component={Settings} />
  </Navigator>
);

export const TabsNavigator = () => (
  <NavigationContainer>
    <TabNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: { borderTopColor: '#EDF1F7', borderTopWidth: 1 },
});
