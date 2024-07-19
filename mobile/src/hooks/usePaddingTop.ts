import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const usePaddingTop = () => {
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + 16;

  return paddingTop;
};
