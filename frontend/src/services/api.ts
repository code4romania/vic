import axios from 'axios';

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
  return request;
});

API.interceptors.response.use(
  async (response) => {
    return response;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: any) => {
    // Redirect to login once we have restricted access
    if (error.response.status === 401) {
      window.location.href = '/login';
    }

    // if not any of the auth error codes throw the error
    throw error;
  },
);

export default API;
