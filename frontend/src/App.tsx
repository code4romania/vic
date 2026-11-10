import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContextProvider from './contexts/auth/AuthContextProvider';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { TOAST_DURATION } from './hooks/useToast';

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
      {/* bottom right (full width at the bottom on phones): never over the header's buttons */}
      <ToastContainer
        position="bottom-right"
        autoClose={TOAST_DURATION.success}
        limit={3}
        closeOnClick
        rtl={false}
      />
      <Router />
    </AuthContextProvider>
  </QueryClientProvider>
);
export default App;
