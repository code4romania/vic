import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();

  return (
    <header className="bg-white">
      <nav className="sm:px-10  py-4 px-4" aria-label="Top">
        <div className="w-full flex gap-4 justify-between items-center">
          <button
            aria-label={'Login'}
            className="bg-turquoise-700 sm:text-base text-sm sm:px-6 sm:py-2 px-2 py-1 shadow rounded-full text-white font-titilliumBold"
            onClick={login}
          >
            Login
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Login;
