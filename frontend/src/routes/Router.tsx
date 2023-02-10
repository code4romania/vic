import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import EditOrganization from '../pages/EditOrganization';
import EditAccessCode from '../pages/EditAccessCode';
import Login from '../pages/Login';
import Organization from '../pages/Organization';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
          <Route index element={<Dashboard />}></Route>
          <Route path="organization" element={<Outlet />}>
            <Route index element={<Organization />} />
            <Route path="edit" element={<EditOrganization />} />
          </Route>
          <Route path="access-codes" element={<Outlet />}>
            <Route index element={<div></div>} />
            <Route path="edit" element={<EditAccessCode />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
