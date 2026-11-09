import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import googleIcon from '../../assets/svg/google';
import { PressableScale } from '../ui/PressableScale';
import { VText } from '../ui/VText';
import { colors, radius } from '../../common/theme/tokens';

export type SocialButtonKind = 'apple' | 'google' | 'email';

const AppleGlyph = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.3-3.52zM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.57-1.22z"
    />
  </Svg>
);

const MailGlyph = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18v12H3zM3 7l9 6 9-6"
      stroke={colors.ink}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const icons: Record<SocialButtonKind, ReactNode> = {
  apple: <AppleGlyph />,
  google: <SvgXml xml={googleIcon} width={22} height={22} />,
  email: <MailGlyph />,
};

export interface SocialButtonProps {
  kind: SocialButtonKind;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/** Entry button (canvas `.sbtn`): Apple is black, the others are white with a gray outline. */
export const SocialButton = ({ kind, label, onPress, disabled, testID }: SocialButtonProps) => {
  const dark = kind === 'apple';
  return (
    <PressableScale
      testID={testID}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, dark ? styles.dark : styles.line, disabled ? styles.disabled : null]}
    >
      <View style={styles.icon}>{icons[kind]}</View>
      <VText variant="button" color={dark ? colors.white : colors.ink} style={styles.label}>
        {label}
      </VText>
    </PressableScale>
  );
};

export default SocialButton;

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  dark: { backgroundColor: colors.black },
  line: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.grab },
  disabled: { opacity: 0.5 },
  icon: { width: 24, alignItems: 'center' },
  // centered in the button, not in the space left of the icon
  label: { flex: 1, textAlign: 'center', marginRight: 24, fontFamily: 'roboto-medium' },
});
