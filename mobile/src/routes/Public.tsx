import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateAccount from '../screens/CreateAccount';
import ForgotPassword from '../screens/ForgotPassword';
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import ValidateAccount from '../screens/ValidateAccount';
import CreateUser from '../screens/CreateUser';
import ConfirmPassword from '../screens/ConfirmPassword';

const { Navigator, Screen } = createNativeStackNavigator();

const Public = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="landing" component={Landing} />
    <Screen name="login" component={Login} />
    <Screen name="create-account" component={CreateAccount} />
    <Screen name="validate-account" component={ValidateAccount} />
    <Screen name="forgot-password" component={ForgotPassword} />
    <Screen name="confirm-password" component={ConfirmPassword} />
    <Screen name="create-user" component={CreateUser} />
  </Navigator>
);

export default Public;
