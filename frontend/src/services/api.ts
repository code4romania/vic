import { fetchAuthSession } from 'aws-amplify/auth';
import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { IBusinessException } from '../common/interfaces/business-exception.interface';

// https://vitejs.dev/guide/env-and-mode.html
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(async (request) => {
  // add auth header with jwt if account is logged in and request is to the api url
  try {
    const { tokens } = await fetchAuthSession();

    if (!request.headers) {
      request.headers = {} as AxiosRequestHeaders;
    }

    if (tokens?.accessToken) {
      request.headers.Authorization = `Bearer ${tokens.accessToken.toString()}`;
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
  async (error: AxiosError<IBusinessException<symbol>>) => {
    // Redirect to login once we have restricted access
    if (error?.response?.status === 401) {
      window.location.href = '/login';
    }

    // if not any of the auth error codes throw the error
    throw error;
  },
);

export default API;
