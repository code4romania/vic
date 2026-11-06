import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/app_logo.svg';

// The centered card used by the public auth pages (login, forgot password, set password, confirm email).
const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="min-h-[100vh] w-full flex items-center justify-center bg-gray-50 px-4 py-8">
    <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col gap-6">
      <Link to="/" className="self-center">
        <img src={logo} alt="VIC" className="max-h-11" />
      </Link>
      <h1 className="font-robotoBold text-xl text-center">{title}</h1>
      {children}
    </div>
  </div>
);

export default AuthLayout;
