/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContextProvider from './contexts/auth/AuthContextProvider';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import { Amplify } from 'aws-amplify';
import { AMPLIFY_CONFIG } from './common/config/amplify';

import 'react-toastify/dist/ReactToastify.css';

// Configure Amplify for Login
Amplify.configure(AMPLIFY_CONFIG as any);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 0, // DEFAULT: 0 seconds
      cacheTime: 300000, // DEFAULT: 5 minutes (300000 ms)
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      suspense: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <ToastContainer position="top-right" autoClose={30000} limit={3} closeOnClick rtl={false} />
      <Router />
    </AuthContextProvider>
  </QueryClientProvider>
);
export default App;
