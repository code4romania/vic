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

  describe('requestLoginCode (#514)', () => {
    it('sends the trimmed email, remembers it and resolves with the masked email', async () => {
      api.requestLogin.mockResolvedValue({ maskedEmail: 'e•••@seed.test' });
      const ctx = await setup();

      let masked = '';
      await act(async () => {
        masked = await ctx.current.requestLoginCode(' elena@seed.test ');
      });

      expect(api.requestLogin).toHaveBeenCalledWith('elena@seed.test');
      expect(masked).toBe('e•••@seed.test');
      expect(ctx.current.userName).toBe('elena@seed.test');
    });

    it.each(['AUTH_010', 'AUTH_004'])('%s shows its message', async (code) => {
      api.requestLogin.mockRejectedValue(httpError(code === 'AUTH_010' ? 429 : 403, code));
      const ctx = await setup();

      await expect(ctx.current.requestLoginCode('a@b.ro')).rejects.toBeDefined();
      expect(toastTexts()).toEqual([[i18n.t(`auth:errors.${code}`), undefined]]);
    });

    it('shows no toast on 503: the Maintenance screen takes over', async () => {
      api.requestLogin.mockRejectedValue(httpError(503, 'MAINTENANCE'));
      const ctx = await setup();

      await expect(ctx.current.requestLoginCode('a@b.ro')).rejects.toBeDefined();
      expect(toast).not.toHaveBeenCalled();
    });
  });

  describe('loginWithCode (#514)', () => {
    const codeSentTo = async (email: string) => {
      api.requestLogin.mockResolvedValue({ maskedEmail: 'm•••' });
      const ctx = await setup();
      await act(async () => {
        await ctx.current.requestLoginCode(email);
      });
      return ctx;
    };

    it('logs in with the code for the remembered email, stores the tokens, loads the profile', async () => {
      api.loginWithCode.mockResolvedValue(SESSION);
      profileCall.mockResolvedValue(PROFILE);
      const ctx = await codeSentTo('elena@seed.test');

      await act(() => ctx.current.loginWithCode(' 651778 '));

      expect(api.loginWithCode).toHaveBeenCalledWith('elena@seed.test', '651778');
      expect(await getAccessToken()).toBe('access');
      expect(await getRefreshToken()).toBe('refresh');
      await waitFor(() => expect(ctx.current.isAuthenticated).toBe(true));
    });

    it('a new volunteer (no profile: 404 or USER_001) settles with createUser', async () => {
      api.loginWithCode.mockResolvedValue(SESSION);
      profileCall.mockRejectedValue(httpError(400, 'USER_001'));
      const ctx = await codeSentTo('new@a2.test');

      await expect(ctx.current.loginWithCode('123456')).rejects.toEqual({ createUser: true });
      await waitFor(() => expect(ctx.current.isUserPending).toBe(true));
    });

    it('a wrong code (AUTH_005) says so', async () => {
      api.loginWithCode.mockRejectedValue(httpError(400, 'AUTH_005'));
      const ctx = await codeSentTo('a@b.ro');

      await expect(ctx.current.loginWithCode('111111')).rejects.toBeDefined();
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.code_mismatch'), undefined]]);
    });

    it('too many wrong codes (AUTH_006) asks for a new one', async () => {
      api.loginWithCode.mockRejectedValue(httpError(400, 'AUTH_006'));
      const ctx = await codeSentTo('a@b.ro');

      await expect(ctx.current.loginWithCode('111111')).rejects.toBeDefined();
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.AUTH_006'), undefined]]);
    });

    it('settles (no hang) when the profile fails for another reason', async () => {
      api.loginWithCode.mockResolvedValue(SESSION);
      profileCall.mockRejectedValue(httpError(500));
      const ctx = await codeSentTo('a@b.ro');

      await expect(ctx.current.loginWithCode('123456')).rejects.toMatchObject({
        response: { status: 500 },
      });
      expect(toastTexts()).toEqual([[i18n.t('auth:errors.init_profile'), undefined]]);
    });
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

  it('has no password flows any more (#514)', async () => {
    const ctx = await setup();
    for (const removed of [
      'confirmSignUp',
      'login',
      'signUp',
      'changePassword',
      'forgotPassword',
    ]) {
      expect(removed in ctx.current).toBe(false);
    }
  });
});
