import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateAccount from '../screens/CreateAccount';
import ForgotPassword from '../screens/ForgotPassword';
import Landing from '../screens/Landing';
import Login from '../screens/Login';

const { Navigator, Screen } = createNativeStackNavigator();

const Public = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="landing" component={Landing} />
    <Screen name="login" component={Login} />
    <Screen name="create-account" component={CreateAccount} />
    <Screen name="forgot-password" component={ForgotPassword} />
  </Navigator>
);

export default Public;
