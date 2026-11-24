import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import i18n from '../common/config/i18n';
import Login from './Login';
import Onboarding from './Onboarding';
import Landing from './Landing';
import { CodeInput } from '../components/auth/CodeInput';
import { TEST_LANGUAGE, containing, t } from '../test/i18n';

// The official mock finishes every animation at once, which would skip the auto-advancing stories to
// the end; here timing animations never finish, so only taps move between stories.
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: () => false,
  withTiming: (toValue: number) => toValue,
}));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
jest.mock('expo-linking', () => ({
  createURL: (p: string) => p,
  openURL: jest.fn(async () => true),
}));

const mockAuth = {
  isUserPending: false,
  requestLoginCode: jest.fn(async () => 'a***@e***.ro'),
  loginWithCode: jest.fn(async () => undefined),
  loginWithSocial: jest.fn(async () => undefined),
};
jest.mock('../hooks/useAuth', () => ({ useAuth: () => mockAuth }));

const { Navigator, Screen } = createNativeStackNavigator();

const renderStack = (
  initialRouteName: string,
  initialParams?: Record<string, unknown>,
  extra: Record<string, React.ComponentType<any>> = {},
) =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
          <Screen name="landing" component={Landing} />
          <Screen name="login" component={Login} initialParams={initialParams} />
          <Screen name="onboarding" component={Onboarding} />
          {Object.entries(extra).map(([name, component]) => (
            <Screen key={name} name={name} component={component} />
          ))}
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CodeInput', () => {
  it('keeps only digits, caps at 6 and reports completion once full', async () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    const Harness = () => {
      const [value, setValue] = React.useState('');
      return (
        <CodeInput
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
          onComplete={onComplete}
          accessibilityLabel="cod"
          testID="code"
        />
      );
    };
    await render(<Harness />);
    await fireEvent.changeText(screen.getByTestId('code'), '12a3');
    expect(onChange).toHaveBeenLastCalledWith('123');
    expect(onComplete).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByTestId('code'), '1234567');
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
    expect(screen.getByText('6')).toBeTruthy();
  });
});

describe('Login, code step', () => {
  it('shows where the code went and logs in when the 6th digit is typed', async () => {
    await renderStack('login', { email: 'ana@example.ro', maskedEmail: 'a***@e***.ro' });
    expect(await screen.findByText(t('login:code.title'))).toBeTruthy();
    expect(screen.getByText('a***@e***.ro')).toBeTruthy();
    expect(screen.getByText(containing(t('login:code.resend_in', { seconds: 60 })))).toBeTruthy();

    await act(async () => {
      await fireEvent.changeText(await screen.findByTestId('login-code'), '654321');
    });

    expect(mockAuth.loginWithCode).toHaveBeenCalledWith('654321');
  });

  it('clears the boxes after a wrong code so it can be typed again', async () => {
    mockAuth.loginWithCode.mockRejectedValueOnce(new Error('AUTH_011'));
    await renderStack('login', { email: 'ana@example.ro', maskedEmail: 'a***@e***.ro' });
    await act(async () => {
      await fireEvent.changeText(await screen.findByTestId('login-code'), '000000');
    });
    expect(screen.getByTestId('login-code').props.value).toBe('');
  });

  it('opens CreateUser when the code belongs to a new account', async () => {
    mockAuth.loginWithCode.mockRejectedValueOnce({ createUser: true });
    const CreateUser = () => <Text>create-user</Text>;
    await renderStack(
      'login',
      { email: 'nou@example.ro', maskedEmail: 'n***@e***.ro' },
      { 'create-user': CreateUser },
    );
    await act(async () => {
      await fireEvent.changeText(await screen.findByTestId('login-code'), '111111');
    });
    expect(await screen.findByText('create-user')).toBeTruthy();
  });

  it('"Alt email" goes back to the email step with the address kept', async () => {
    await renderStack('login', { email: 'ana@example.ro', maskedEmail: 'a***@e***.ro' });
    await fireEvent.press(await screen.findByText(t('login:code.other_email')));
    expect(await screen.findByDisplayValue('ana@example.ro')).toBeTruthy();
  });
});

describe('the language before login', () => {
  const other = TEST_LANGUAGE === 'ro' ? 'en' : 'ro';
  const inOther = (key: string, options?: Record<string, unknown>) =>
    `${i18n.t(key, { ...options, lng: other })}`;

  it('the intro can be switched from its first screen and goes on in the new language', async () => {
    await renderStack('onboarding');
    await screen.findByTestId('onboarding');
    expect(screen.getByText(t('onboarding:stories.organizations.title'))).toBeTruthy();

    await fireEvent.press(screen.getByTestId(`onboarding-language-${other}`));

    expect(await screen.findByText(inOther('onboarding:stories.organizations.title'))).toBeTruthy();
    expect(screen.getByText(inOther('onboarding:skip'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    expect(screen.getByText(inOther('onboarding:stories.events.title'))).toBeTruthy();
    // remembered as a choice, for the account that logs in later
    expect(JSON.parse((await AsyncStorage.getItem('vic.language')) as string)).toEqual({
      language: other,
      pending: true,
    });
  });

  it('the entry screen has the switch too', async () => {
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    await renderStack('landing');
    await waitFor(() => expect(screen.getByTestId('login-google')).toBeTruthy());
    expect(screen.getByText(t('landing:title'))).toBeTruthy();

    await fireEvent.press(screen.getByTestId(`landing-language-${other}`));

    expect(await screen.findByText(inOther('landing:title'))).toBeTruthy();
    expect(screen.getByText(inOther('landing:social.google'))).toBeTruthy();
    expect(screen.getByText(inOther('landing:terms_link'))).toBeTruthy();
  });

  it('the login screen switches with an error on screen, and the error follows', async () => {
    await renderStack('login');
    await fireEvent.changeText(await screen.findByTestId('login-email-input'), 'nu-e-email');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('login-send'));
    });
    expect(screen.getByText(t('login:form.email.pattern'))).toBeTruthy();

    await fireEvent.press(screen.getByTestId(`login-language-${other}`));

    expect(await screen.findByText(inOther('login:form.email.pattern'))).toBeTruthy();
    expect(screen.getByText(inOther('login:title'))).toBeTruthy();
    // what was typed is still there
    expect(screen.getByDisplayValue('nu-e-email')).toBeTruthy();
  });

  it('the code step keeps the switch beside the back button', async () => {
    await renderStack('login', { email: 'ana@example.ro', maskedEmail: 'a***@e***.ro' });
    expect(await screen.findByText(t('login:code.title'))).toBeTruthy();

    await fireEvent.press(screen.getByTestId(`login-language-${other}`));

    expect(await screen.findByText(inOther('login:code.title'))).toBeTruthy();
    expect(screen.getByTestId('login-back')).toBeTruthy();
  });
});

describe('Login, email step', () => {
  it.each([
    [new Error('Network Error'), t('auth:errors.login')],
    [{ response: { status: 429, data: {} } }, t('auth:errors.AUTH_010')],
  ])('keeps a failed send visible at the email field', async (error, message) => {
    mockAuth.requestLoginCode.mockRejectedValueOnce(error);
    await renderStack('login');
    await fireEvent.changeText(await screen.findByTestId('login-email-input'), 'ana@example.ro');
    await fireEvent.press(screen.getByTestId('login-send'));
    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.queryByTestId('button-spinner')).toBeNull();
    expect(screen.queryByTestId('login-code')).toBeNull();
  });

  it('validates the address before sending a code', async () => {
    await renderStack('login');
    await fireEvent.changeText(await screen.findByTestId('login-email-input'), 'nu-e-email');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('login-send'));
    });
    expect(mockAuth.requestLoginCode).not.toHaveBeenCalled();
    expect(screen.getByText(t('login:form.email.pattern'))).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('login-email-input'), 'ana@example.ro');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('login-send'));
    });
    expect(mockAuth.requestLoginCode).toHaveBeenCalledWith('ana@example.ro');
    expect(await screen.findByText(t('login:code.title'))).toBeTruthy();
  });

  it('opens the terms and the privacy policy, not the VIC information page (audit #11)', async () => {
    process.env.EXPO_PUBLIC_TERMS_AND_CONDITIONS_LINK = 'https://example.ro/termeni';
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_LINK = 'https://example.ro/confidentialitate';
    const Linking = require('expo-linking');
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    await renderStack('landing');
    await fireEvent.press(await screen.findByTestId('landing-terms'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.ro/termeni');
    await fireEvent.press(screen.getByTestId('landing-privacy'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.ro/confidentialitate');
  });
});

describe('Landing', () => {
  it('keeps a failed send visible in the email sheet and allows retrying', async () => {
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    mockAuth.requestLoginCode.mockRejectedValueOnce(new Error('Network Error'));
    await renderStack('landing');
    await fireEvent.changeText(await screen.findByTestId('email-input'), 'ana@example.ro');
    await fireEvent.press(screen.getByTestId('email-send'));
    expect(await screen.findByText(t('auth:errors.login'))).toBeTruthy();
    expect(screen.queryByTestId('button-spinner')).toBeNull();
    await fireEvent.press(screen.getByTestId('email-send'));
    expect(await screen.findByText(t('login:code.title'))).toBeTruthy();
  });

  it('opens the intro on the first start only', async () => {
    await renderStack('landing');
    expect(await screen.findByTestId('onboarding')).toBeTruthy();
  });

  it('skips the intro once it was seen, offers Google and email, and no Facebook', async () => {
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    await renderStack('landing');
    await waitFor(() => expect(screen.getByTestId('login-google')).toBeTruthy());
    expect(screen.queryByTestId('onboarding')).toBeNull();
    expect(screen.getByTestId('login-email')).toBeTruthy();
    expect(screen.queryByText(/Facebook/)).toBeNull();

    await fireEvent.press(screen.getByTestId('login-google'));
    expect(mockAuth.loginWithSocial).toHaveBeenCalledWith('google');
  });

  it('the outline "Vezi prezentarea" button opens the intro again', async () => {
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    await renderStack('landing');
    await fireEvent.press(await screen.findByTestId('landing-intro'));
    expect(await screen.findByTestId('onboarding')).toBeTruthy();
  });

  it('sends the code from the email sheet and moves to the code step', async () => {
    await AsyncStorage.setItem('vic.onboarding.seen', '1');
    await renderStack('landing');
    await fireEvent.changeText(await screen.findByTestId('email-input'), 'ana@example.ro');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('email-send'));
    });
    expect(mockAuth.requestLoginCode).toHaveBeenCalledWith('ana@example.ro');
    expect(await screen.findByText(t('login:code.title'))).toBeTruthy();
  });
});

describe('Onboarding', () => {
  it('moves through the four stories and remembers it was seen', async () => {
    await renderStack('landing');
    await screen.findByTestId('onboarding');
    expect(screen.getByText(t('onboarding:stories.organizations.title'))).toBeTruthy();

    await fireEvent.press(screen.getByTestId('onboarding-next'));
    expect(screen.getByText(t('onboarding:stories.events.title'))).toBeTruthy();
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    await fireEvent.press(screen.getByTestId('onboarding-next'));
    expect(screen.getByText(t('onboarding:stories.documents.title'))).toBeTruthy();
    expect(screen.queryByTestId('onboarding-next')).toBeNull();

    await act(async () => {
      await fireEvent.press(screen.getByTestId('onboarding-start'));
    });
    expect(await AsyncStorage.getItem('vic.onboarding.seen')).toBe('1');
    await waitFor(() => expect(screen.queryByTestId('onboarding')).toBeNull());
  });

  it('tapping the left third goes back, the rest goes forward', async () => {
    await renderStack('onboarding');
    const stage = await screen.findByTestId('onboarding-stage');
    await fireEvent.press(stage, { nativeEvent: { locationX: 300 } });
    expect(screen.getByText(t('onboarding:stories.events.title'))).toBeTruthy();
    await fireEvent.press(stage, { nativeEvent: { locationX: 40 } });
    expect(screen.getByText(t('onboarding:stories.organizations.title'))).toBeTruthy();
  });

  it('"Sari peste" closes the intro', async () => {
    await renderStack('landing');
    await screen.findByTestId('onboarding');
    await act(async () => {
      await fireEvent.press(screen.getByTestId('onboarding-skip'));
    });
    await waitFor(() => expect(screen.queryByTestId('onboarding')).toBeNull());
    expect(screen.getByTestId('login-email')).toBeTruthy();
  });
});
