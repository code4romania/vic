import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import RootRoute from './RootRoute';
import PublicRoute from './PublicRoute';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import LoadingContent from '../components/LoadingContent';

// Route-level code splitting: each page is its own chunk, loaded when first opened, so the first
// load does not carry every page (and the charts, date pickers, spreadsheets they bring).
const AccessRequest = lazy(() => import('../pages/AccessRequest'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const EditAccessCode = lazy(() => import('../pages/EditAccessCode'));
const Login = lazy(() => import('../pages/Login'));
const Organization = lazy(() => import('../pages/Organization'));
const Approvals = lazy(() => import('../pages/Approvals'));
const Settings = lazy(() => import('../pages/Settings'));
const SuperAdminLists = lazy(() => import('../pages/SuperAdminLists'));
const AccessCodes = lazy(() => import('../containers/query/AccessCodesWithQueryParams'));
const Volunteers = lazy(() => import('../containers/query/VolunteersWithQueryParams'));
const AddAccessCode = lazy(() => import('../pages/AddAccessCode'));
const EditActivityType = lazy(() => import('../pages/EditActivityType'));
const Announcements = lazy(() => import('../containers/query/AnnouncementsWithQueryParms'));
const Volunteer = lazy(() => import('../containers/query/VolunteerWithQueryParams'));
const EditVolunteer = lazy(() => import('../pages/EditVolunteer'));
const AddVolunteer = lazy(() => import('../pages/AddVolunteer'));
const ImportVolunteers = lazy(() => import('../pages/ImportVolunteers'));
const AddActivityType = lazy(() => import('../pages/AddActivityType'));
const ActivityTypes = lazy(() => import('../containers/query/ActivityTypesWithQueryParams'));
const Events = lazy(() => import('../containers/query/EventsWithQueryParams'));
const Event = lazy(() => import('../containers/query/EventWithQueryParams'));
const AddEvent = lazy(() => import('../pages/AddEvent'));
const EditEvent = lazy(() => import('../pages/EditEvent'));
const AddAnnouncement = lazy(() => import('../pages/AddAnnouncement'));
const EditAnnouncement = lazy(() => import('../pages/EditAnnouncement'));
const Announcement = lazy(() => import('../pages/Announcement'));
const ActivityLogs = lazy(() => import('../containers/query/ActivityLogsWithQueryParams'));
const AddActivityLog = lazy(() => import('../containers/query/AddActivityLogWithQueryParams'));
const Contracts = lazy(() => import('../pages/Contracts'));
const ActionsArchive = lazy(() => import('../pages/ActionsArchive'));
const LoginLink = lazy(() => import('../pages/LoginLink'));
const ConfirmEmail = lazy(() => import('../pages/ConfirmEmail'));
const NotFound = lazy(() => import('../pages/NotFound'));
const RegisterOrganization = lazy(() => import('../pages/RegisterOrganization'));
const Team = lazy(() => import('../pages/Team'));
const OrganizationValidation = lazy(() => import('../pages/OrganizationValidation'));

const SetPasswordRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={`/login/link${search}`} replace />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Suspense fallback={<LoadingContent />}>
          <Routes>
            <Route path="/login" element={<PublicRoute element={<Login />} />} />
            <Route path="/register" element={<PublicRoute element={<RegisterOrganization />} />} />
            {/* Neutral: reachable logged in or out (a link opened in a browser with a session). */}
            <Route path="/login/link" element={<LoginLink />} />
            {/* Links emailed before the switch to magic links (#514) pointed here. */}
            <Route path="/set-password" element={<SetPasswordRedirect />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/" element={<RootRoute />}>
              <Route index element={<Dashboard />}></Route>
              <Route path="organization" element={<Outlet />}>
                <Route index element={<Organization />} />
                {/* the profile is edited in place on "Configurare organizație" */}
                <Route path="edit" element={<Navigate to="/organization" replace />} />
                <Route path="team" element={<Team />} />
              </Route>
              <Route path="volunteers" element={<Outlet />}>
                <Route index element={<Volunteers />} />
                <Route path="add" element={<AddVolunteer />} />
                <Route path="import" element={<ImportVolunteers />} />
                <Route path=":id" element={<Volunteer />} />
                <Route path=":id/edit" element={<EditVolunteer />} />
                <Route path="access-codes" element={<Outlet />}>
                  <Route index element={<AccessCodes />} />
                  <Route path="add" element={<AddAccessCode />} />
                  <Route path=":id/edit" element={<EditAccessCode />} />
                </Route>
                {/* #499: the lists moved to the approvals page */}
                <Route path="requests" element={<Navigate to="/approvals/volunteers" replace />} />
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
                <Route path="registrations" element={<Navigate to="/approvals/events" replace />} />
                <Route path=":id" element={<Event />} />
                <Route path=":id/edit" element={<EditEvent />} />
                <Route path="add" element={<AddEvent />} />
              </Route>
              <Route path="activity-log" element={<Outlet />}>
                <Route index element={<ActivityLogs />} />
                <Route path="add" element={<AddActivityLog />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="approvals/:type" element={<Approvals />} />
              <Route path="admin/validation" element={<OrganizationValidation />} />
              <Route path="admin/:list" element={<SuperAdminLists />} />
              <Route path="actions-archive" element={<Outlet />}>
                <Route index element={<ActionsArchive />} />
              </Route>
              <Route path="documents" element={<Outlet />}>
                <Route index element={<Navigate to={'contracts'} />} />
                <Route path="contracts" element={<Contracts />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </QueryParamProvider>
    </BrowserRouter>
  );
};

export default Router;
