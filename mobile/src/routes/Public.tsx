import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import CreateUser from '../screens/CreateUser';

const { Navigator, Screen } = createNativeStackNavigator();

const Public = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="landing" component={Landing} />
    <Screen name="login" component={Login} />
    <Screen name="create-user" component={CreateUser} />
  </Navigator>
);

export default Public;
