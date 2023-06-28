import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ActivityLog from '../screens/ActivityLog';
import ActivityLogs from '../screens/ActivityLogs';
import AddActivityLog from '../screens/AddActivityLog';
import EditActivityLog from '../screens/EditActivityLog';
import EditVolunteer from '../screens/EditVolunteer';
import Event from '../screens/Event';
import JoinEvent from '../screens/JoinEvent';
import JoinOrganization from '../screens/JoinOrganization';
import LeaveOrganization from '../screens/LeaveOrganization';
import News from '../screens/News';
import OrganizationProfile from '../screens/OrganizationProfile';
import VolunteerProfile from '../screens/VolunteerProfile';
import AccountData from '../screens/AccountData';
import IdentityData from '../screens/IdentityData';
import ChangePassword from '../screens/ChangePassword';
import NotificationsSettings from '../screens/NotificationsSettings';
import DrawerNavigator from './Drawer';
import CreateVolunteer from '../screens/CreateVolunteer';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import JoinByAccessCode from '../screens/JoinByAccessCode';
import Documents from '../screens/Documents';
import Contract from '../screens/Contract';

const { Navigator, Screen, Group } = createNativeStackNavigator();

const Private = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Group>
      <Screen name="home" component={DrawerNavigator} />
      <Screen name="news" component={News} />
      <Screen name="announcements" component={News} />
      <Screen name="volunteer-profile" component={VolunteerProfile} />
      <Screen name="activity-logs" component={ActivityLogs} />
      <Screen name="organization-profile" component={OrganizationProfile} />
      <Screen name="join-organization" component={JoinOrganization} />
      <Screen name="join-by-access-code" component={JoinByAccessCode} />
      <Screen name="event" component={Event} />
      <Screen name="account-data" component={AccountData} />
      <Screen name="identity-data" component={IdentityData} />
      <Screen name="change-password" component={ChangePassword} />
      <Screen name="notifications-settings" component={NotificationsSettings} />
      <Screen name="privacy-policy" component={PrivacyPolicy} />
      <Screen name="documents" component={Documents} />
      <Screen name="contract" component={Contract} />
    </Group>
    <Group screenOptions={{ presentation: 'modal' }}>
      <Screen name="join-event" component={JoinEvent} />
      <Screen name="leave-organization" component={LeaveOrganization} />
      <Screen name="edit-volunteer" component={EditVolunteer} />
      <Screen name="add-activity-log" component={AddActivityLog} />
      <Screen name="activity-log" component={ActivityLog} />
      <Screen name="edit-activity-log" component={EditActivityLog} />
      <Screen name="create-volunteer" component={CreateVolunteer} />
    </Group>
  </Navigator>
);

export default Private;
