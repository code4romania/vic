import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContextProvider from './contexts/auth/AuthContextProvider';
import Router from './routes/Router';

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
      <Router />
    </AuthContextProvider>
  </QueryClientProvider>
);
export default App;
