import React from 'react';
import { Linking, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../../test/i18n';
import BrandBandFrame, { CODE4RO_URL, WithWindowInsets } from './BrandBand';

const Insets = ({ testID }: { testID: string }) => {
  const insets = useSafeAreaInsets();
  return <Text testID={testID}>{`${insets.top}`}</Text>;
};

// Maria, 27 Nov 2026: "Un proiect Code for Romania/Commit Global" with the logo, on every screen
describe('BrandBandFrame', () => {
  const renderFrame = () =>
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 760 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <BrandBandFrame>
          <Insets testID="screen" />
          <WithWindowInsets>
            <Insets testID="modal" />
          </WithWindowInsets>
        </BrandBandFrame>
      </SafeAreaProvider>,
    );

  it('takes the status bar area, so the screens below get no top inset', async () => {
    await renderFrame();
    expect(screen.getByTestId('brand-band')).toHaveStyle({ paddingTop: 47 });
    expect(screen.getByText(t('general:brand_band'))).toBeTruthy();
    expect(screen.getByTestId('screen')).toHaveTextContent('0');
    // a modal over the whole window keeps the real inset
    expect(screen.getByTestId('modal')).toHaveTextContent('47');
  });

  it('opens the Code for Romania site', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await renderFrame();
    await fireEvent.press(screen.getByRole('link', { name: t('general:brand_band') }));
    expect(open).toHaveBeenCalledWith(CODE4RO_URL);
  });
});
