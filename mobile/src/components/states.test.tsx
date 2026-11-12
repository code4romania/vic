import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import '../common/config/i18n';
import MissingEntity from '../screens/MissingEntity';
import SystemState from './SystemState';
import LoadingScreen from './LoadingScreen';
import { toastConfig } from '../common/config/toast';
import { palette } from '../design/tokens';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('VIC 2.0 states', () => {
  it('a full-screen state shows its picture, text, action and an optional back button', async () => {
    const onAction = jest.fn();
    const onBack = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <MissingEntity
          kind="offline"
          heading="Ești offline"
          paragraph="Verifică conexiunea la internet și încearcă din nou."
          actionBtnLabel="Încearcă din nou"
          onActionBtnPress={onAction}
          onBackButtonPress={onBack}
        />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('state-icon-offline')).toBeTruthy();
    expect(screen.getByText('Ești offline')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('state-action'));
    await fireEvent.press(screen.getByTestId('state-back'));
    expect(onAction).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });

  it('without a back handler there is no back button (update, maintenance)', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <MissingEntity
          kind="update"
          heading="Actualizează aplicația"
          paragraph=""
          actionBtnLabel="Actualizează"
          onActionBtnPress={jest.fn()}
        />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('state-icon-update')).toBeTruthy();
    expect(screen.queryByTestId('state-back')).toBeNull();
  });

  it('a system state (maintenance, update) is paper with a big title and the yellow action', async () => {
    const onAction = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <SystemState
          kicker="VIC"
          title="VIC se actualizează"
          description="Revenim în câteva minute."
          actionLabel="Încearcă din nou"
          onAction={onAction}
          testID="maintenance"
        />
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('maintenance')).toHaveStyle({ backgroundColor: palette.paper });
    expect(screen.getByRole('header')).toHaveTextContent('VIC se actualizează');
    expect(screen.getByText('Revenim în câteva minute.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('state-action'));
    expect(onAction).toHaveBeenCalled();
  });

  it('the loading screen is the VIC hexagon on paper, announced as loading', async () => {
    await render(<LoadingScreen />);
    expect(screen.getByTestId('loading-screen')).toHaveStyle({ backgroundColor: palette.paper });
    expect(screen.getByLabelText('Se încarcă...')).toBeTruthy();
  });

  it('toasts are navy pills with an icon circle for success, error and info', async () => {
    await render(
      <>
        {toastConfig.success({ text1: 'Răspunsul a fost trimis' })}
        {toastConfig.error({ text1: 'Eroare la încărcarea datelor', text2: 'cod #E502' })}
        {toastConfig.info({ text1: 'Fără conexiune' })}
      </>,
    );
    expect(screen.getByTestId('toast-ok')).toBeTruthy();
    expect(screen.getByTestId('toast-no')).toBeTruthy();
    expect(screen.getByTestId('toast-neutral')).toBeTruthy();
    expect(screen.getByText('cod #E502')).toBeTruthy();
    expect(screen.getByTestId('toast-ok')).toHaveStyle({ backgroundColor: palette.navy });
    expect(screen.getByText('Răspunsul a fost trimis')).toHaveStyle({ color: palette.white });
  });
});
