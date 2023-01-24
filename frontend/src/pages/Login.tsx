import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();

  return (
    <div>
      This is login <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
