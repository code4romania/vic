import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Text, Button } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  console.log('Settings');

  const { logout } = useAuth();

  return (
    <PageLayout title="Settings">
      <Text category="h1">Settings</Text>
      <Button onPress={logout}>Logout</Button>
    </PageLayout>
  );
};

export default Settings;
