import React, { useContext } from 'react';
import { AuthContext } from '../contexts/auth/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);

  return (
    <div>
      This is login <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;
