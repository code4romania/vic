import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, render, screen } from '@testing-library/react-native';
import i18n from '../common/config/i18n';
import Tabs from './Tabs';

jest.mock('expo-blur', () => ({ BlurView: () => null }));
jest.mock('expo-glass-effect', () => ({
  GlassView: () => null,
  isLiquidGlassAvailable: () => false,
}));
// the tab bar is what is tested here, not the screens behind it
jest.mock('../screens/Home', () => () => null);
jest.mock('../screens/Events', () => () => null);
jest.mock('../screens/ActivityLogs', () => () => null);
jest.mock('../screens/Documents', () => () => null);
jest.mock('../screens/Settings', () => () => null);
jest.mock('../screens/Volunteer', () => () => null);
jest.mock('../screens/Organizations', () => () => null);

const labels = () =>
  ['dashboard', 'events', 'hours', 'docs', 'profile'].map(
    (tab) => screen.getByTestId(`tab-${tab}`).props.accessibilityLabel,
  );

describe('the tab bar', () => {
  it('changes its labels with the language, without a restart', async () => {
    await i18n.changeLanguage('ro');
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <NavigationContainer>
          <Tabs />
        </NavigationContainer>
      </SafeAreaProvider>,
    );
    expect(labels()).toEqual(['Acasă', 'Evenimente', 'Ore', 'Documente', 'Profil']);

    await act(async () => {
      await i18n.changeLanguage('en');
    });

    expect(labels()).toEqual(['Home', 'Events', 'Hours', 'Documents', 'Profile']);
  });
});
