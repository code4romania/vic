import './App.css';
import AuthContextProvider from './contexts/auth/AuthContextProvider';
import Router from './routes/Router';

const App = () => (
  <AuthContextProvider>
    <Router />
  </AuthContextProvider>
);
export default App;
