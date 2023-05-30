import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AccessRequest from '../pages/AccessRequest';
import Dashboard from '../pages/Dashboard';
import EditOrganization from '../pages/EditOrganization';
import EditAccessCode from '../pages/EditAccessCode';
import Login from '../pages/Login';
import Organization from '../containers/query/OrganizationWithQueryParam';
import RegistrationRequests from '../containers/query/AccessRequestsWithQueryParams';
import AccessCodes from '../containers/query/AccessCodesWithQueryParams';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Volunteers from '../containers/query/VolunteersWithQueryParams';
import AddAccessCode from '../pages/AddAccessCode';
import EditActivityType from '../pages/EditActivityType';
import Announcements from '../containers/query/AnnouncementsWithQueryParms';
import Volunteer from '../containers/query/VolunteerWithQueryParams';
import EditVolunteer from '../pages/EditVolunteer';
import AddActivityType from '../pages/AddActivityType';
import ActivityTypes from '../containers/query/ActivityTypesWithQueryParams';
import Events from '../containers/query/EventsWithQueryParams';
import Event from '../containers/query/EventWithQueryParams';
import AddEvent from '../pages/AddEvent';
import EditEvent from '../pages/EditEvent';
import AddAnnouncement from '../pages/AddAnnouncement';
import EditAnnouncement from '../pages/EditAnnouncement';
import Announcement from '../pages/Announcement';
import ActivityLogs from '../containers/query/ActivityLogsWithQueryParams';
import AddActivityLog from '../pages/AddActivityLog';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import ActionsArchive from '../containers/query/ActionsArchiveWithQueryParams';
import Contracts from '../containers/query/ContractsWithQueryParams';
import AddContractTemplate from '../pages/AddContractTemplate';
import AddContract from '../pages/AddContract';

const Router = () => {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
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
            <Route path="events" element={<Outlet />}>
              <Route index element={<Events />} />
              <Route path=":id" element={<Event />} />
              <Route path=":id/edit" element={<EditEvent />} />
              <Route path="add" element={<AddEvent />} />
            </Route>
            <Route path="activity-log" element={<Outlet />}>
              <Route index element={<ActivityLogs />} />
              <Route path="add" element={<AddActivityLog />} />
            </Route>
            <Route path="actions-archive" element={<Outlet />}>
              <Route index element={<ActionsArchive />} />
            </Route>
            <Route path="documents" element={<Outlet />}>
              <Route index element={<Navigate to={'contracts'} />} />
              <Route path="contracts" element={<Outlet />}>
                <Route index element={<Contracts />} />
                <Route path="add-template" element={<AddContractTemplate />} />
                <Route path="add-contract" element={<AddContract />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  );
};

export default Router;
