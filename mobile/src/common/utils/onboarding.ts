import AsyncStorage from '@react-native-async-storage/async-storage';

// The intro stories show once, on the first start. "Vezi prezentarea" on the login screen reopens them.
const ONBOARDING_SEEN_KEY = 'vic.onboarding.seen';

export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === '1';
  } catch {
    // storage failing must not trap anyone in the intro
    return true;
  }
};

export const markOnboardingSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1');
  } catch {
    // ignored: at worst the intro shows again next time
  }
};
