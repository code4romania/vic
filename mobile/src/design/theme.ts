// Unistyles 3 configuration: themes are role tokens, so dark mode (phase 2) is one more theme.
import { StyleSheet } from 'react-native-unistyles';
import {
  elevation,
  fontFamily,
  fontScaleCap,
  glass,
  hit,
  lightColors,
  radius,
  space,
  status,
  tabBar,
  type,
} from './tokens';

export const lightTheme = {
  colors: lightColors,
  status,
  space,
  radius,
  fontFamily,
  type,
  glass,
  elevation,
  hit,
  tabBar,
  fontScaleCap,
} as const;

const appThemes = { light: lightTheme };

type AppThemes = typeof appThemes;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { initialTheme: 'light' },
});
