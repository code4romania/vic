import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Organization from '../pages/Organization';
import RegistrationRequests from '../pages/RegistrationRequests';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
          <Route index element={<Dashboard />}></Route>
          <Route path="organization" element={<Organization />}></Route>
          <Route path="volunteers" element={<Outlet />}>
            <Route index element={<Navigate to={'list'} replace={true}></Navigate>} />
            <Route path="list" element={<div>this is volunteers list</div>} />
            <Route path="registration-requests" element={<RegistrationRequests />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
