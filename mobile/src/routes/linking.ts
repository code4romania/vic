import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

// vic://login?email= from the web's set-password and confirm-email pages (decisions R17): opens
// Login with the email filled in. Only the public routes have a 'login' screen, so a logged-in
// user just stays where they are.
export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.createURL('/'), 'vic://'],
  config: {
    initialRouteName: 'landing' as never,
    screens: {
      login: 'login',
    },
  },
};
