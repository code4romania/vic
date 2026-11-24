import React from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../common/config/i18n';
import { LANGUAGE_KEY } from '../common/config/language';
import useStore from '../store/store';
import { setUserLanguage } from '../services/user/user.api';
import { LanguageRow, LanguageToggle } from './LanguageSwitcher';
import { FieldLabel } from '../design/components/TextField';

jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('../services/user/user.api', () => ({ setUserLanguage: jest.fn() }));

const patch = setUserLanguage as jest.Mock;
const stored = async () => JSON.parse((await AsyncStorage.getItem(LANGUAGE_KEY)) ?? 'null');

// a piece of a screen: a translated text and a design component that says a word of its own
const Screen = () => {
  const { t } = useTranslation('settings');
  return (
    <>
      <Text testID="copy">{t('logout')}</Text>
      <FieldLabel label="Telefon" optional />
    </>
  );
};

// the sheet reads the safe area
const withSafeArea = (children: React.ReactNode) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 47, left: 0, right: 0, bottom: 34 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

beforeEach(async () => {
  jest.clearAllMocks();
  await i18n.changeLanguage('ro');
  useStore.setState({ userProfile: null });
  patch.mockImplementation(async (language: string) => ({ language }));
});

describe('the language switch of the screens before login', () => {
  it('shows the two languages, with the current one selected', async () => {
    await render(<LanguageToggle />);

    expect(screen.getByLabelText('Română').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByLabelText('English').props.accessibilityState).toMatchObject({
      selected: false,
    });
    // the group is named in the language the app is in
    expect(screen.getByTestId('language-toggle').props.accessibilityLabel).toBe('Limba aplicației');
  });

  it('changes the whole screen at once, without a restart, and remembers the choice', async () => {
    await render(
      <>
        <LanguageToggle />
        <Screen />
      </>,
    );
    expect(screen.getByTestId('copy')).toHaveTextContent('Deconectare');
    expect(screen.getByText('Telefon opțional')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('language-toggle-en'));

    await waitFor(() => expect(screen.getByTestId('copy')).toHaveTextContent('Log out'));
    // the design components follow too, through the labels the app gives them
    expect(screen.getByText('Telefon optional')).toBeTruthy();
    expect(screen.getByLabelText('English').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByTestId('language-toggle').props.accessibilityLabel).toBe('App language');
    // nobody is logged in: the choice waits for the account
    expect(patch).not.toHaveBeenCalled();
    expect(await stored()).toEqual({ language: 'en', pending: true });

    await fireEvent.press(screen.getByTestId('language-toggle-ro'));
    await waitFor(() => expect(screen.getByTestId('copy')).toHaveTextContent('Deconectare'));
    expect(await stored()).toEqual({ language: 'ro', pending: true });
  });

  it('does nothing when the current language is pressed', async () => {
    await render(<LanguageToggle />);

    await fireEvent.press(screen.getByTestId('language-toggle-ro'));

    expect(i18n.language).toBe('ro');
    expect(await stored()).toBeNull();
  });

  it('each half is a 44pt target', async () => {
    await render(<LanguageToggle />);
    for (const language of ['ro', 'en']) {
      expect(screen.getByTestId(`language-toggle-${language}`)).toHaveStyle({
        minWidth: 44,
        minHeight: 44,
      });
    }
  });
});

describe('„Limba aplicației” in Profil', () => {
  beforeEach(() => {
    useStore.setState({ userProfile: { id: 'u1', firstName: 'Ana', language: 'ro' } as any });
  });

  it('shows the current language and opens the two choices', async () => {
    await render(withSafeArea(<LanguageRow />));

    const row = screen.getByTestId('profile-language');
    expect(row).toHaveTextContent(/Limba aplicației/);
    expect(row).toHaveTextContent(/Română/);

    await fireEvent.press(row);

    expect(screen.getByTestId('language-option-ro').props.accessibilityLabel).toBe(
      'Română, selectată',
    );
    expect(screen.getByTestId('language-option-en').props.accessibilityLabel).toBe('English');
    // says what else changes with it
    expect(
      screen.getByText('Notificările și emailurile de la VIC vin în limba aleasă.'),
    ).toBeTruthy();
  });

  it('choosing English changes the app and saves it on the account', async () => {
    await render(
      withSafeArea(
        <>
          <LanguageRow />
          <Screen />
        </>,
      ),
    );
    await fireEvent.press(screen.getByTestId('profile-language'));

    await fireEvent.press(screen.getByTestId('language-option-en'));

    await waitFor(() => expect(screen.getByTestId('copy')).toHaveTextContent('Log out'));
    expect(screen.getByTestId('profile-language')).toHaveTextContent(/App language/);
    expect(screen.getByTestId('profile-language')).toHaveTextContent(/English/);
    await waitFor(() => expect(patch).toHaveBeenCalledWith('en', true));
    await waitFor(async () => expect(await stored()).toEqual({ language: 'en', pending: false }));
    expect(useStore.getState().userProfile?.language).toBe('en');
  });

  it('choosing the language it is already in sends nothing', async () => {
    await render(withSafeArea(<LanguageRow />));
    await fireEvent.press(screen.getByTestId('profile-language'));

    await fireEvent.press(screen.getByTestId('language-option-ro'));

    expect(patch).not.toHaveBeenCalled();
    expect(i18n.language).toBe('ro');
  });
});
