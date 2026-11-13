// Header of the „Îndrăzneț” pages and modals: a 44pt round white button (back or close), the title
// in Bricolage and an optional "Editează" action, on paper.
import React, { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { AppText } from '../design/components/Text';
import { springTo } from '../design/motion';
import { ChevronLeftIcon, CloseIcon, EditIcon } from '../design/icons';
import { hit, palette } from '../design/tokens';
import { displayTitle } from './displayTitle';

export interface RoundIconButtonProps {
  icon: 'back' | 'close';
  onPress: () => void;
  accessibilityLabel: string;
  testID?: string;
  /** white (on paper) or glass (on navy) */
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
}

/** 44pt round button with a chevron or a cross; shrinks to .94 with the snappy spring. */
export const RoundIconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  testID,
  tone = 'light',
  style,
}: RoundIconButtonProps) => {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : 1 - 0.06 * pressed.value }],
  }));
  const Icon = icon === 'back' ? ChevronLeftIcon : CloseIcon;
  const color = tone === 'dark' ? palette.white : palette.navy;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={style}
    >
      <Animated.View style={[styles.round, tone === 'dark' ? styles.roundDark : null, scale]}>
        <Icon size={icon === 'back' ? 24 : 20} color={color} strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
};

export interface LayoutHeaderProps {
  title: string;
  /** the round button on the left */
  leading?: ReactNode;
  onEditButtonPress?: () => void;
  editLabel?: string;
  editTestID?: string;
  style?: StyleProp<ViewStyle>;
}

export const LayoutHeader = ({
  title,
  leading,
  onEditButtonPress,
  editLabel,
  editTestID,
  style,
}: LayoutHeaderProps) => (
  <View style={[styles.header, style]}>
    {leading}
    {/* long titles („Completează profil voluntar”) wrap to a second line instead of being cut */}
    <AppText
      variant="title"
      numberOfLines={2}
      style={[styles.title, !leading ? styles.titleAlone : null]}
      accessibilityRole="header"
    >
      {title}
    </AppText>
    {onEditButtonPress && (
      <Pressable
        onPress={onEditButtonPress}
        accessibilityRole="button"
        accessibilityLabel={editLabel}
        hitSlop={8}
        testID={editTestID}
        style={styles.edit}
      >
        <EditIcon size={16} color={palette.navy} strokeWidth={2.4} />
        <AppText variant="label">{editLabel}</AppText>
      </Pressable>
    )}
  </View>
);

export default LayoutHeader;

const styles = StyleSheet.create((theme) => ({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.m,
    paddingHorizontal: theme.space.gutter,
    paddingVertical: theme.space.s,
  },
  round: {
    width: hit.min,
    height: hit.min,
    borderRadius: hit.min / 2,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundDark: { backgroundColor: 'rgba(255,255,255,0.14)' },
  title: { flex: 1, minWidth: 0, ...displayTitle(22, 1.1, -0.025) },
  titleAlone: displayTitle(24, 1.1, -0.025),
  edit: {
    flexShrink: 0,
    minHeight: hit.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.card,
  },
}));
