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
import EditActivityType from '../pages/EditActivityType';
import Announcements from '../pages/Announcements';
import Volunteer from '../pages/Volunteer';
import EditVolunteer from '../pages/EditVolunteer';
import AddActivityType from '../pages/AddActivityType';
import ActivityTypes from '../pages/ActivityTypes';
import AddAnnouncement from '../pages/AddAnnouncement';
import EditAnnouncement from '../pages/EditAnnouncement';
import Announcement from '../pages/Announcement';
import ActivityLog from '../pages/ActivityLog';

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
            <Route path=":id/edit" element={<EditVolunteer />} />
            <Route path="access-codes" element={<Outlet />}>
              <Route index element={<AccessCodes />} />
              <Route path="add" element={<AddAccessCode />} />
              <Route path=":id/edit" element={<EditAccessCode />} />
            </Route>
            <Route path="requests" element={<RegistrationRequests />} />
            <Route path="requests/:id" element={<AccessRequest />} />
          </Route>
          <Route path="announcements" element={<Outlet />}>
            <Route index element={<Announcements />} />
            <Route path="add" element={<AddAnnouncement />} />
            <Route path=":id/edit" element={<EditAnnouncement />} />
            <Route path=":id" element={<Announcement />} />
          </Route>
          <Route path="activity-types" element={<Outlet />}>
            <Route index element={<ActivityTypes />} />
            <Route path="add" element={<AddActivityType />} />
            <Route path="edit/:id" element={<EditActivityType />} />
          </Route>
          <Route path="activity-log" element={<Outlet />}>
            <Route index element={<ActivityLog />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
