import React, { useContext } from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import AuthContextProvider from './AuthContextProvider';
import { AuthContext } from './AuthContext';
import * as authApi from '../../services/auth/auth.api';
import { getUserProfile } from '../../services/user/user.api';
import { getAccessToken, getRefreshToken, setTokens } from '../../services/auth/token.storage';
import { authEvents } from '../../services/auth/auth.events';
import useStore from '../../store/store';
import i18n from '../../common/config/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../services/auth/auth.api');
jest.mock('../../services/user/user.api', () => ({ getUserProfile: jest.fn() }));

const api = authApi as jest.Mocked<typeof authApi>;
const profileCall = getUserProfile as jest.Mock;
const toast = Toast.show as jest.Mock;

const SESSION = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 };
const PROFILE = { id: 'u1', firstName: 'Elena', myOrganizations: [] };

const httpError = (status: number, code_error?: string) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { code_error } } });

// Renders the provider and hands back the live context value.
const setup = async () => {
  const ref: { current: React.ContextType<typeof AuthContext> } = { current: null as any };
  const Probe = () => {
    ref.current = useContext(AuthContext);
    return null;
  };
  await render(
    <AuthContextProvider>
      <Probe />
    </AuthContextProvider>,
  );
  await waitFor(() => expect(ref.current).toBeTruthy());
  return ref;
};

// A logged-in install: tokens stored and the one-time cleanup already done (else it wipes them).
const loggedInBefore = async () => {
  await AsyncStorage.setItem('vic.legacyCleared', '1');
  await setTokens({ accessToken: 'a', refreshToken: 'r' });
};

const toastTexts = () => toast.mock.calls.map(([options]) => [options.text1, options.text2]);

beforeEach(() => {
  jest.clearAllMocks();
  useStore.setState({ userProfile: null });
  delete process.env.EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AuthContextProvider', () => {
  it('starts logged out without stored tokens and never asks for a profile', async () => {
    const ctx = await setup();
    expect(ctx.current.isAuthenticated).toBe(false);
    expect(profileCall).not.toHaveBeenCalled();
  });

  it('logs in on start when a refresh token is stored', async () => {
    await loggedInBefore();
    profileCall.mockResolvedValue(PROFILE);

    const ctx = await setup();

    await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));
  });

  describe('login', () => {
    it('stores the tokens and loads the profile', async () => {
      api.login.mockResolvedValue(SESSION);
      profileCall.mockResolvedValue(PROFILE);
      const ctx = await setup();

      await act(() => ctx.current.login({ username: ' elena@seed.test ', password: 'pw' }) as any);

      expect(api.login).toHaveBeenCalledWith('elena@seed.test', 'pw');
      expect(await getRefreshToken()).toBe('refresh');
      await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));
    });

    it('AUTH_001 shows the migration hint until the notice date, and not after', async () => {
      process.env.EXPO_PUBLIC_MIGRATION_NOTICE_UNTIL = '2026-12-31';
      api.login.mockRejectedValue(httpError(401, 'AUTH_001'));
      const ctx = await setup();

      jest.useFakeTimers({ now: new Date('2026-12-31T12:00:00'), doNotFake: ['nextTick'] });
      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toBeDefined();
      expect(toastTexts()).toEqual([
        [i18n.t('auth:errors.AUTH_001'), i18n.t('auth:errors.migration_hint')],
      ]);

      toast.mockClear();
      jest.setSystemTime(new Date('2027-01-01T08:00:00'));
      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toBeDefined();
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.AUTH_001'), undefined]]);
    });

    it('AUTH_003 asks the screen to resend the confirmation link', async () => {
      api.login.mockRejectedValue(httpError(403, 'AUTH_003'));
      const ctx = await setup();

      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toEqual({
        confirmAccount: true,
      });
      expect(toast).not.toHaveBeenCalled();
      await waitFor(() => expect(ctx.current.userName).toBe('a@b.ro'));
    });

    it('settles with createUser when the login has no profile yet (404 or USER_001)', async () => {
      api.login.mockResolvedValue(SESSION);
      profileCall.mockRejectedValue(httpError(400, 'USER_001'));
      const ctx = await setup();

      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toEqual({
        createUser: true,
      });
      await waitFor(() => expect(ctx.current.isUserPending).toBe(true));
    });

    it('settles (no hang) when the profile fails for another reason', async () => {
      api.login.mockResolvedValue(SESSION);
      profileCall.mockRejectedValue(httpError(500));
      const ctx = await setup();

      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toMatchObject({
        response: { status: 500 },
      });
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.init_profile'), undefined]]);
    });

    it('shows no toast on 503: the Maintenance screen takes over', async () => {
      api.login.mockRejectedValue(httpError(503, 'MAINTENANCE'));
      const ctx = await setup();

      await expect(ctx.current.login({ username: 'a@b.ro', password: 'x' })).rejects.toBeDefined();
      expect(toast).not.toHaveBeenCalled();
    });
  });

  describe('signUp', () => {
    it('registers and remembers the email and phone for the next screens', async () => {
      api.register.mockResolvedValue({ maskedEmail: 'm•••@a2.test' });
      const ctx = await setup();

      await act(
        () =>
          ctx.current.signUp({
            username: 'mira@a2.test',
            password: 'pw',
            phoneNumber: '+40712340001',
          }) as any,
      );

      expect(api.register).toHaveBeenCalledWith('mira@a2.test', 'pw', '+40712340001');
      expect(ctx.current.userName).toBe('mira@a2.test');
      expect(ctx.current.initialPhoneNumber).toBe('+40712340001');
    });

    it('AUTH_009 says the email is taken', async () => {
      api.register.mockRejectedValue(httpError(409, 'AUTH_009'));
      const ctx = await setup();

      await expect(
        ctx.current.signUp({ username: 'a@b.ro', password: 'pw', phoneNumber: '+40712340001' }),
      ).rejects.toBeDefined();
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.username_exists'), undefined]]);
    });
  });

  it('forgotPasswordSubmit resets with the code and logs in', async () => {
    api.resetPassword.mockResolvedValue(SESSION);
    profileCall.mockResolvedValue(PROFILE);
    const ctx = await setup();

    await act(() => ctx.current.forgotPassword('mira@a2.test'));
    await act(() => ctx.current.forgotPasswordSubmit('651778', 'New-Pass1!'));

    expect(api.resetPassword).toHaveBeenCalledWith('mira@a2.test', '651778', 'New-Pass1!');
    expect(await getAccessToken()).toBe('access');
    await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));
  });

  it('a wrong reset code says so', async () => {
    api.resetPassword.mockRejectedValue(httpError(400, 'AUTH_005'));
    const ctx = await setup();

    await expect(ctx.current.forgotPasswordSubmit('111111', 'New-Pass1!')).rejects.toBeDefined();
    expect(toastTexts()).toEqual([[i18n.t('auth:errors.code_mismatch'), undefined]]);
  });

  describe('loginWithSocial', () => {
    it.each([
      [
        'google' as const,
        () =>
          (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
            type: 'success',
            data: { idToken: 'google-id-token' },
          }),
        'google-id-token',
      ],
      [
        'apple' as const,
        () =>
          (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
            identityToken: 'apple-id-token',
          }),
        'apple-id-token',
      ],
    ])('%s posts the provider token and loads the profile', async (provider, arrange, token) => {
      arrange();
      api.loginWithSocial.mockResolvedValue(SESSION);
      profileCall.mockResolvedValue(PROFILE);
      const ctx = await setup();

      await act(() => ctx.current.loginWithSocial(provider));

      expect(api.loginWithSocial).toHaveBeenCalledWith(provider, token);
      await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));
    });

    it('a new social volunteer goes to CreateUser', async () => {
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
        type: 'success',
        data: { idToken: 'google-id-token' },
      });
      api.loginWithSocial.mockResolvedValue(SESSION);
      profileCall.mockRejectedValue(httpError(404));
      const ctx = await setup();

      await act(() => ctx.current.loginWithSocial('google'));

      await waitFor(() => expect(ctx.current.isUserPending).toBe(true));
      expect(toast).not.toHaveBeenCalled();
    });

    it('a closed sheet shows nothing and calls no API', async () => {
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ type: 'cancelled' });
      const ctx = await setup();

      await act(() => ctx.current.loginWithSocial('google'));

      expect(api.loginWithSocial).not.toHaveBeenCalled();
      expect(toast).not.toHaveBeenCalled();
    });

    it('Facebook without an app id fails with the social message', async () => {
      const ctx = await setup();

      await act(() => ctx.current.loginWithSocial('facebook'));

      expect(api.loginWithSocial).not.toHaveBeenCalled();
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.social_failed'), undefined]]);
    });

    it('a refused social token (AUTH_013) shows its message', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({ identityToken: 't' });
      api.loginWithSocial.mockRejectedValue(httpError(401, 'AUTH_013'));
      const ctx = await setup();

      await act(() => ctx.current.loginWithSocial('apple'));

      expect(toastTexts()).toEqual([[i18n.t('auth:errors.AUTH_013'), undefined]]);
    });
  });

  it('logout ends the backend session and clears everything', async () => {
    await loggedInBefore();
    profileCall.mockResolvedValue(PROFILE);
    api.logout.mockResolvedValue();
    const ctx = await setup();
    await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));

    await act(() => ctx.current.logout() as any);

    expect(api.logout).toHaveBeenCalledWith('r');
    expect(await getRefreshToken()).toBeNull();
    expect(useStore.getState().userProfile).toBeNull();
    expect(ctx.current.isAuthenticated).toBe(false);
  });

  it('a refresh the backend refused (authEvents logout) logs out', async () => {
    await loggedInBefore();
    profileCall.mockResolvedValue(PROFILE);
    const ctx = await setup();
    await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));

    await act(async () => authEvents.emit('logout'));

    await waitFor(() => expect(ctx.current.isAuthenticated).toBe(false));
    expect(useStore.getState().userProfile).toBeNull();
  });

  it('has no confirmSignUp any more (decisions R30)', async () => {
    const ctx = await setup();
    expect('confirmSignUp' in ctx.current).toBe(false);
  });
});
