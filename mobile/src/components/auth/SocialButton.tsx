// Entry buttons „Îndrăzneț” on the navy landing: Apple and Google are white 56pt buttons (radius 20,
// like Button L) with their own marks; the outline tone is the white-outlined secondary button for
// navy backgrounds. Pressed: scale .96 with the snappy spring.
import React, { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import googleIcon from '../../assets/svg/google';
import { AppText } from '../../design/components/Text';
import { springTo } from '../../design/motion';
import { MailIcon } from '../../design/icons';
import { palette } from '../../design/tokens';

export type SocialButtonKind = 'apple' | 'google' | 'email' | 'plain';
export type SocialButtonTone = 'light' | 'outline';

const AppleGlyph = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Path
      fill={palette.black}
      d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.3-3.52zM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.57-1.22z"
    />
  </Svg>
);

const icon = (kind: SocialButtonKind, tone: SocialButtonTone): ReactNode => {
  switch (kind) {
    case 'apple':
      return <AppleGlyph />;
    case 'google':
      return <SvgXml xml={googleIcon} width={22} height={22} />;
    case 'email':
      return (
        <MailIcon
          size={22}
          color={tone === 'outline' ? palette.white : palette.navy}
          strokeWidth={2}
        />
      );
    default:
      return null;
  }
};

export interface SocialButtonProps {
  kind: SocialButtonKind;
  label: string;
  onPress: () => void;
  tone?: SocialButtonTone;
  disabled?: boolean;
  testID?: string;
}

export const SocialButton = ({
  kind,
  label,
  onPress,
  tone = 'light',
  disabled,
  testID,
}: SocialButtonProps) => {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const body = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : 1 - 0.04 * pressed.value }],
    opacity: 1 - 0.12 * pressed.value,
  }));
  const glyph = icon(kind, tone);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      style={disabled ? styles.disabled : null}
    >
      <Animated.View
        style={[styles.button, tone === 'outline' ? styles.outline : styles.light, body]}
      >
        {glyph ? <View style={styles.icon}>{glyph}</View> : null}
        <AppText
          variant="button"
          color={
            tone === 'outline' ? palette.white : kind === 'apple' ? palette.black : palette.navy
          }
          style={[styles.label, glyph ? styles.labelWithIcon : null]}
        >
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
};

export default SocialButton;

const styles = StyleSheet.create((theme) => ({
  button: {
    minHeight: 56,
    borderRadius: theme.radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  light: { backgroundColor: theme.colors.card },
  outline: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  disabled: { opacity: 0.45 },
  icon: { width: 24, alignItems: 'center' },
  label: { flex: 1, textAlign: 'center' },
  // centered in the button, not in the space left of the icon
  labelWithIcon: { marginRight: 24 },
}));
