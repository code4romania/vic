import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';
import { WithWindowInsets } from '../components/brand/BrandBand';
import Landing from '../screens/Landing';
import Login from '../screens/Login';
import CreateUser from '../screens/CreateUser';
import Onboarding from '../screens/Onboarding';

const { Navigator, Screen } = createNativeStackNavigator();

// On iOS the full-screen modal covers the Code for Romania band: it needs the real status bar inset
const OnboardingOverBand = (props: any) =>
  Platform.OS === 'ios' ? (
    <WithWindowInsets>
      <Onboarding {...props} />
    </WithWindowInsets>
  ) : (
    <Onboarding {...props} />
  );

const Public = () => (
  <Navigator screenOptions={{ headerShown: false }}>
    <Screen name="landing" component={Landing} />
    <Screen name="login" component={Login} />
    <Screen name="create-user" component={CreateUser} />
    {/* first-run intro stories, over Landing */}
    <Screen
      name="onboarding"
      component={OnboardingOverBand}
      options={{ presentation: 'fullScreenModal', animation: 'fade' }}
    />
  </Navigator>
);

export default Public;
