// Status pills and quick options „Îndrăzneț”.
// StatusChip: solid 28pt pills; every status has a color plus an icon or a texture, so it never
// depends on color alone (ok ✓, no ✕, wait = yellow/navy stripes inside a navy outline).
// OptionChip: the quick option under a field (`.opt`), navy with yellow text when selected.
import React, { ReactNode, useId } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { hit, palette, status, StatusKind } from '../tokens';
import { springTo } from '../motion';
import { haptics } from '../haptics';
import { CheckIcon, CloseIcon } from '../icons';
import { AppText } from './Text';

export type { StatusKind };

/** API status → pill kind (approved→ok, pending→wait, rejected→no, expired→exp, expiresSoon→soon). */
export const statusKind = (apiStatus?: string | null): StatusKind => {
  switch (`${apiStatus ?? ''}`.toLowerCase()) {
    case 'approved':
      return 'ok';
    case 'pending':
      return 'wait';
    case 'rejected':
      return 'no';
    case 'expired':
      return 'exp';
    case 'expiressoon':
    case 'expires_soon':
    case 'expiring':
      return 'soon';
    default:
      return 'plain';
  }
};

/** 12×12 rounded square with diagonal navy/yellow stripes (the "pending" texture). */
export const PendingStripes = ({ size = 12 }: { size?: number }) => {
  const id = `stripes-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" testID="status-chip-stripes">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={5}
          height={5}
          patternTransform="rotate(45)"
        >
          <Rect x={0} y={0} width={2.5} height={5} fill={palette.navy} />
          <Rect x={2.5} y={0} width={2.5} height={5} fill={palette.yellow} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width={12} height={12} rx={4} fill={`url(#${id})`} />
    </Svg>
  );
};

export interface StatusChipProps {
  label: string;
  kind?: StatusKind;
  /** replaces the default status icon */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const StatusChip = ({ label, kind = 'plain', icon, style, testID }: StatusChipProps) => {
  const colors = status[kind];
  const mark =
    icon ??
    (kind === 'ok' ? (
      <CheckIcon size={14} color={colors.fg} strokeWidth={3} />
    ) : kind === 'no' ? (
      <CloseIcon size={14} color={colors.fg} strokeWidth={3} />
    ) : kind === 'wait' ? (
      <PendingStripes />
    ) : null);
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.status,
        { backgroundColor: colors.bg },
        kind === 'wait' ? styles.waitOutline : null,
        mark ? null : styles.noMark,
        style,
      ]}
    >
      {mark}
      <AppText color={colors.fg} numberOfLines={1} style={styles.statusLabel}>
        {label}
      </AppText>
    </View>
  );
};

export interface OptionChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const OPTION_HEIGHT = 34;

export const OptionChip = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  testID,
  accessibilityLabel,
  style,
}: OptionChipProps) => {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : interpolate(pressed.value, [0, 1], [1, 0.94]) }],
  }));
  const slop = Math.ceil((hit.min - OPTION_HEIGHT) / 2);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={{ top: slop, bottom: slop, left: 2, right: 2 }}
      onPress={() => {
        haptics.selection();
        onPress?.();
      }}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      style={[styles.optionHit, disabled ? styles.optionDisabled : null, style]}
    >
      <Animated.View style={[styles.option, selected ? styles.optionOn : null, scale]}>
        {icon}
        <AppText
          color={selected ? palette.yellow : palette.navy}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.optionLabel}
        >
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
};

export default StatusChip;

const styles = StyleSheet.create((theme) => ({
  status: {
    minHeight: 28,
    borderRadius: theme.radius.chip,
    paddingLeft: theme.space.xs,
    paddingRight: theme.space.s,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  noMark: { paddingLeft: theme.space.s },
  waitOutline: { borderWidth: 2, borderColor: theme.colors.navy },
  statusLabel: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 12.5,
    lineHeight: 16,
    flexShrink: 1,
  },
  optionHit: { maxWidth: '100%', flexShrink: 1 },
  optionDisabled: { opacity: 0.45 },
  option: {
    minHeight: OPTION_HEIGHT,
    paddingHorizontal: theme.space.m,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionOn: { backgroundColor: theme.colors.navy, borderColor: theme.colors.navy },
  optionLabel: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 13,
    lineHeight: 17,
    flexShrink: 1,
  },
}));
