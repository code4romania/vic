import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContextProvider from './contexts/auth/AuthContextProvider';
import Router from './routes/Router';
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
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
      <ToastContainer
        position={toast.POSITION.TOP_RIGHT}
        autoClose={30000}
        limit={3}
        closeOnClick
        rtl={false}
      />
      <Router />
    </AuthContextProvider>
  </QueryClientProvider>
);
export default App;
