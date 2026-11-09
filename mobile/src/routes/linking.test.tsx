import React from 'react';
import { getStateFromPath, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { FeatherIconsPack } from '../common/adapters/feather-icons.adapter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { linking } from './linking';
import Login from '../screens/Login';

jest.mock('expo-linking', () => ({ createURL: (path: string) => `exp+vic://${path}` }));

// The web's set-password and confirm-email pages answer { realm: 'mobile', email } (R17) and offer
// vic://login?email=<that email>.
describe('vic://login deep link', () => {
  it('opens Login with the email as a param, Landing underneath', () => {
    const state = getStateFromPath('login?email=mira%40a2.test', linking.config as any);

    expect(state?.routes.map((route) => route.name)).toEqual(['landing', 'login']);
    expect(state?.routes[1].params).toEqual({ email: 'mira@a2.test' });
  });

  it('a cold start through the link shows Login with the email filled in', async () => {
    const { Navigator, Screen } = createNativeStackNavigator();
    const Landing = () => <Text>landing</Text>;

    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <IconRegistry icons={FeatherIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <NavigationContainer
            linking={{
              ...linking,
              getInitialURL: async () => 'vic://login?email=mira%40a2.test',
              subscribe: () => () => undefined,
            }}
          >
            <Navigator screenOptions={{ headerShown: false }}>
              <Screen name="landing" component={Landing} />
              <Screen name="login" component={Login} />
            </Navigator>
          </NavigationContainer>
        </ApplicationProvider>
      </SafeAreaProvider>,
    );

    expect(await screen.findByDisplayValue('mira@a2.test')).toBeTruthy();
  });
});
