import React from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AccessRequest from '../pages/AccessRequest';
import Dashboard from '../pages/Dashboard';
import EditOrganization from '../pages/EditOrganization';
import EditAccessCode from '../pages/EditAccessCode';
import Login from '../pages/Login';
import Organization from '../pages/Organization';
import RegistrationRequests from '../pages/AccessRequests';
import AccessCodes from '../pages/AccesCodes';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Volunteers from '../pages/Volunteers';
import AddAccessCode from '../pages/AddAccessCode';
import ActivityCategories from '../pages/ActivityCategories';
import Volunteer from '../pages/Volunteer';

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
          <Route path="volunteers" element={<Outlet />}>
            <Route index element={<Volunteers />} />
            <Route path=":id" element={<Volunteer />} />
            <Route path="access-codes" element={<Outlet />}>
              <Route index element={<AccessCodes />} />
              <Route path="add" element={<AddAccessCode />} />
              <Route path="edit/:id" element={<EditAccessCode />} />
            </Route>
            <Route path="requests" element={<RegistrationRequests />} />
            <Route path="requests/:id" element={<AccessRequest />} />
          </Route>
          <Route path="activity-categories" element={<Outlet />}>
            <Route index element={<ActivityCategories />} />
            <Route path="add" element={<p>Add activity category</p>} />
            <Route path="edit/:id" element={<p>Edit activity</p>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
