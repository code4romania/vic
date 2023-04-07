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
import Organization from '../screens/Organization';
import OrganizationProfile from '../screens/OrganizationProfile';
import VolunteerProfile from '../screens/VolunteerProfile';
import Tabs from './Tabs';

const { Navigator, Screen, Group } = createNativeStackNavigator();

const Private = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Group>
      <Screen name="home" component={Tabs} />
      <Screen name="news" component={News} />
      <Screen name="organization" component={Organization} />
      <Screen name="volunteer-profile" component={VolunteerProfile} />
      <Screen name="activity-logs" component={ActivityLogs} />
      <Screen name="organization-profile" component={OrganizationProfile} />
      <Screen name="join-organization" component={JoinOrganization} />
      <Screen name="event" component={Event} />
      <Screen name="join-event" component={JoinEvent} />
    </Group>
    <Group screenOptions={{ presentation: 'modal' }}>
      <Screen name="leave-organization" component={LeaveOrganization} />
      <Screen name="edit-volunteer" component={EditVolunteer} />
      <Screen name="add-activity-log" component={AddActivityLog} />
      <Screen name="view-activity-log" component={ActivityLog} />
      <Screen name="edit-activity-log" component={EditActivityLog} />
    </Group>
  </Navigator>
);

export default Private;