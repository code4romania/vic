import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import GlassTabBar, { GlassTabBarItem } from './GlassTabBar';
import { nextCollapse, TabBarScrollProvider } from './TabBarScroll';
import { resetTabBarOverlays, useHideTabBarWhile } from './tab-bar-overlay';

jest.mock('expo-blur', () => ({ BlurView: () => null }));

const items: Record<string, GlassTabBarItem> = {
  dashboard: { icon: 'home', label: 'Acasă' },
  events: { icon: 'events', label: 'Evenimente' },
  hours: { icon: 'hours', label: 'Ore' },
  docs: { icon: 'documents', label: 'Documente' },
  profile: { icon: 'profile', label: 'Profil' },
};

const { Navigator, Screen } = createBottomTabNavigator();
const page = (name: string) => () => <Text>{`page:${name}`}</Text>;
const renderTabBar = (props: BottomTabBarProps) => <GlassTabBar {...props} items={items} />;

// a screen with a sheet that opens and closes, like Profil > Log out
const SheetScreen = () => {
  const [open, setOpen] = React.useState(false);
  useHideTabBarWhile(open);
  return (
    <Text testID="toggle-sheet" onPress={() => setOpen(!open)}>
      {open ? 'sheet open' : 'sheet closed'}
    </Text>
  );
};

const renderTabs = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <TabBarScrollProvider>
        <NavigationContainer>
          <Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
            {[...Object.keys(items), 'volunteer'].map((name) => (
              <Screen
                key={name}
                name={name}
                component={name === 'profile' ? SheetScreen : page(name)}
              />
            ))}
          </Navigator>
        </NavigationContainer>
      </TabBarScrollProvider>
    </SafeAreaProvider>,
  );

describe('GlassTabBar', () => {
  it('shows the five VIC 2.0 tabs and no button for hidden routes', async () => {
    await renderTabs();
    for (const label of ['Acasă', 'Evenimente', 'Ore', 'Documente', 'Profil']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.queryByTestId('tab-volunteer')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('marks the active tab with the yellow dot and switches tabs on press', async () => {
    await renderTabs();
    expect(screen.getByTestId('tab-dashboard-dot')).toBeTruthy();
    expect(screen.getByText('page:dashboard')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-hours'));
    });

    expect(await screen.findByText('page:hours')).toBeTruthy();
    expect(screen.getByTestId('tab-hours-dot')).toBeTruthy();
    expect(screen.queryByTestId('tab-dashboard-dot')).toBeNull();
    expect(screen.getByTestId('tab-hours').props.accessibilityState).toEqual({ selected: true });
  });
});

describe('tab bar and bottom sheets', () => {
  afterEach(() => act(() => resetTabBarOverlays()));

  it('steps aside while a sheet is open, so it never covers the sheet buttons', async () => {
    await renderTabs();
    await fireEvent.press(screen.getByTestId('tab-profile'));
    expect(screen.getByTestId('glass-tab-bar').props.pointerEvents).toBe('box-none');
    await fireEvent.press(await screen.findByTestId('toggle-sheet'));
    expect(screen.getByText('sheet open')).toBeTruthy();
    expect(
      screen.getByTestId('glass-tab-bar', { includeHiddenElements: true }).props.pointerEvents,
    ).toBe('none');
    await fireEvent.press(screen.getByTestId('toggle-sheet'));
    expect(screen.getByTestId('glass-tab-bar').props.pointerEvents).toBe('box-none');
  });
});

describe('tab bar collapse on scroll (canvas rule)', () => {
  const run = (offsets: number[]) => {
    let state = { collapsed: 0, accumulated: 0 };
    let previous = 0;
    const history: number[] = [];
    for (const y of offsets) {
      state = nextCollapse(y, previous, state.accumulated, state.collapsed);
      previous = y;
      history.push(state.collapsed);
    }
    return history;
  };

  it('stays full near the top, even when scrolling down', () => {
    expect(run([5, 10, 20, 24])).toEqual([0, 0, 0, 0]);
  });

  it('collapses after 24pt once the user scrolled 10pt further down', () => {
    expect(run([20, 28, 33])).toEqual([0, 0, 1]);
  });

  it('expands again after 10pt of scrolling up, and ignores small jitter', () => {
    expect(run([20, 40, 60, 55, 60, 52, 49])).toEqual([0, 1, 1, 1, 1, 1, 0]);
  });

  it('always expands when back at the top', () => {
    expect(run([40, 80, 20])).toEqual([1, 1, 0]);
  });
});
