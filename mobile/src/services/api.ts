import { Auth } from 'aws-amplify';
import axios, { AxiosRequestHeaders } from 'axios';
import Constants from 'expo-constants';
import useStore from '../store/store';

// Sent on every request. Today's backend ignores it; the own-auth backend answers 426 AUTH_011 when it
// is below MOBILE_MIN_VERSION, which turns this build into an "Update required" screen at the cutover.
export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

// https://vitejs.dev/guide/env-and-mode.html
const API = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}`,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(async (request) => {
  if (!request.headers) {
    request.headers = {} as AxiosRequestHeaders;
  }
  request.headers['x-app-version'] = APP_VERSION;

  // add auth header with jwt if account is logged in and request is to the api url
  try {
    const user = await Auth.currentAuthenticatedUser();

    if (user?.getSignInUserSession()) {
      request.headers.Authorization = `Bearer ${user
        .getSignInUserSession()
        .getAccessToken()
        .getJwtToken()}`;
    }
  } catch (err) {
    // User not authenticated. May be a public API.
    // Catches "The user is not authenticated".
    return request;
  }

  return request;
});

API.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error: any) => {
    // 426: this build is below the backend's MOBILE_MIN_VERSION; the Router shows UpdateRequired.
    if (error?.response?.status === 426) {
      useStore.getState().setUpdateRequired(true);
    }
    // if not any of the auth error codes throw the error
    throw error;
  },
);

export default API;
