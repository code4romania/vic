import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import CreateUser from '../screens/CreateUser';
import Onboarding from '../screens/Onboarding';

const { Navigator, Screen } = createNativeStackNavigator();

const Public = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="landing" component={Landing} />
    <Screen name="login" component={Login} />
    <Screen name="create-user" component={CreateUser} />
    {/* first-run intro stories, over Landing */}
    <Screen
      name="onboarding"
      component={Onboarding}
      options={{ presentation: 'fullScreenModal', animation: 'fade' }}
    />
  </Navigator>
);

export default Public;
