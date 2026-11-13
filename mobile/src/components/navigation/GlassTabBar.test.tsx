import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaInsetsContext, SafeAreaProvider } from 'react-native-safe-area-context';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import GlassTabBar, { GlassTabBarItem, useGlassTabBarInset } from './GlassTabBar';
import { nextCollapse, TabBarScrollProvider, useTabBarAccessory } from './TabBarScroll';
import { resetTabBarOverlays, useHideTabBarWhile } from './tab-bar-overlay';

jest.mock('expo-blur', () => ({ BlurView: () => null }));
jest.mock('expo-glass-effect', () => ({
  GlassView: () => null,
  isLiquidGlassAvailable: () => false,
}));

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

const HoursScreen = () => {
  const accessory = React.useMemo(() => ({ label: 'Adaugă ore', onPress: jest.fn() }), []);
  useTabBarAccessory(accessory);
  return <Text>page:hours</Text>;
};

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
                component={
                  name === 'profile' ? SheetScreen : name === 'hours' ? HoursScreen : page(name)
                }
              />
            ))}
          </Navigator>
        </NavigationContainer>
      </TabBarScrollProvider>
    </SafeAreaProvider>,
  );

describe('GlassTabBar', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['android', 'ios'] as const)('keeps %s label fitting platform-specific', async (os) => {
    jest.replaceProperty(Platform, 'OS', os);
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 320,
      height: 568,
      scale: 2,
      fontScale: 1.3,
    });
    // Reanimated's mock leaves interpolate empty; use the expanded bar's first keyframe.
    jest
      .spyOn(require('react-native-reanimated'), 'interpolate')
      .mockImplementation((_value, _input, output) => (output as number[])[0]);
    await renderTabs();
    await fireEvent.press(screen.getByTestId('tab-hours'));
    for (const label of ['Evenimente', 'Adaugă ore']) {
      const text = screen.getByText(label);
      expect(text.props.adjustsFontSizeToFit).toBe(os === 'ios');
      expect(text.props.allowFontScaling).toBe(os === 'ios');
    }
    expect(screen.getByText('Evenimente')).toHaveStyle({ height: os === 'android' ? 13 : 15 });
  });

  it('shows the five VIC 2.0 tabs and no button for hidden routes', async () => {
    await renderTabs();
    for (const label of ['Acasă', 'Evenimente', 'Ore', 'Documente', 'Profil']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.queryByTestId('tab-volunteer')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(5);
  });

  it('marks the active tab (yellow lens) and switches tabs on press', async () => {
    await renderTabs();
    expect(screen.getByTestId('tab-dashboard').props.accessibilityState).toEqual({
      selected: true,
    });
    expect(screen.getByText('page:dashboard')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-hours'));
    });

    expect(await screen.findByText('page:hours')).toBeTruthy();
    expect(screen.getByTestId('tab-dashboard').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(screen.getByTestId('tab-hours').props.accessibilityState).toEqual({ selected: true });
  });
});

describe('floating bar content clearance', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['ios', 0, 16],
    ['ios', 34, 24],
    ['android', 0, 16],
    ['android', 16, 24],
    ['android', 24, 24],
    ['android', 48, 56],
  ] as const)('%s with a %dpt bottom inset', async (os, bottom, expectedBottom) => {
    jest.replaceProperty(Platform, 'OS', os);
    const { result } = await renderHook(
      () => ({
        bar: useGlassTabBarInset(),
        accessory: useGlassTabBarInset({ accessory: true }),
      }),
      {
        wrapper: ({ children }) => (
          <SafeAreaInsetsContext.Provider value={{ top: 20, left: 0, right: 0, bottom }}>
            {children}
          </SafeAreaInsetsContext.Provider>
        ),
      },
    );
    expect(result.current.bar).toBe(expectedBottom + 68 + 16);
    // The last row clears the expanded action as well as the bar, including its 4pt alignment.
    expect(result.current.accessory).toBe(expectedBottom + 68 + 56 + 10 + 16);
    expect(result.current.accessory).toBeGreaterThan(expectedBottom + 68 + 10 + 56 + 4);
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
    expect(screen.getByTestId('glass-tab-bar', { includeHiddenElements: true })).toHaveStyle({
      transform: [{ translateY: 182 }],
    });
    await fireEvent.press(screen.getByTestId('toggle-sheet'));
    expect(screen.getByTestId('glass-tab-bar').props.pointerEvents).toBe('box-none');
  });
});

describe('tab bar minimise on scroll (iOS 26 rule)', () => {
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

  it('minimises after 24pt of scrolling down', () => {
    expect(run([20, 30, 40, 45])).toEqual([0, 0, 0, 1]);
    expect(run([20, 30, 40, 50])).toEqual([0, 0, 0, 1]);
  });

  it('expands again after 10pt of scrolling up, and ignores small jitter', () => {
    expect(run([20, 40, 60, 55, 60, 52, 49])).toEqual([0, 0, 1, 1, 1, 1, 0]);
  });

  it('always expands when back at the top', () => {
    expect(run([40, 80, 20])).toEqual([1, 1, 0]);
  });
});
