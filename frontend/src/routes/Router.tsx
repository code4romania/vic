import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AccessRequest from '../pages/AccessRequest';
import Dashboard from '../pages/Dashboard';
import EditOrganization from '../pages/EditOrganization';
import Login from '../pages/Login';
import Organization from '../pages/Organization';
import RegistrationRequests from '../pages/RegistrationRequests';
import AccessCodes from '../pages/AccesCodes';
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
          <Route path="volunteers/access-codes" element={<AccessCodes />} />
          <Route path="volunteers/requests" element={<RegistrationRequests />} />
          <Route path="volunteers/requests/:id" element={<AccessRequest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
