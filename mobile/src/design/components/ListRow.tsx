// List row and hexagon avatar „Îndrăzneț”. Rows are 60pt tall at least, padded 12/14, with a
// leading tile (38pt, radius 13, paper) or a hexagon avatar, a Manrope 700 15.5 title, an optional
// subtitle and a trailing chevron / chip / custom node. Inside a Group a hairline separates rows.
import React, { ReactNode } from 'react';
import { Pressable, StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, palette } from '../tokens';
import { ChevronRightIcon, ICON_STROKE, LucideIcon } from '../icons';

// ---------------------------------------------------------------------------------------------
// HexAvatar

export type HexAvatarSize = 'md' | 'lg';
export type HexAvatarTone = 'navy' | 'yellow';

const HEX_SIZE: Record<HexAvatarSize, { width: number; height: number; font: number }> = {
  md: { width: 40, height: 44, font: 14 },
  lg: { width: 64, height: 72, font: 26 },
};

/** Up to two initials from a name ("Asociația Exemplu" → "AE"). */
export const hexInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase('ro-RO') ?? '')
    .join('');

/** Pointy-top hexagon (the handbook clip-path polygon) inside a w×h box. */
const hexPath = (w: number, h: number) =>
  `M${w / 2} 0 L${w} ${h / 4} L${w} ${(h * 3) / 4} L${w / 2} ${h} L0 ${(h * 3) / 4} L0 ${h / 4} Z`;

export interface HexAvatarProps {
  name: string;
  size?: HexAvatarSize;
  tone?: HexAvatarTone;
  testID?: string;
}

/** Navy (yellow initials) or yellow (navy initials) hexagon, 40×44 or 64×72. */
export const HexAvatar = ({ name, size = 'md', tone = 'navy', testID }: HexAvatarProps) => {
  const { width, height, font } = HEX_SIZE[size];
  const fill = tone === 'navy' ? palette.navy : palette.yellow;
  const ink = tone === 'navy' ? palette.yellow : palette.navy;
  return (
    <View
      testID={testID}
      style={[styles.hex, { width, height }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={styles.hexSvg}>
        <Path d={hexPath(width, height)} fill={fill} />
      </Svg>
      <Text
        maxFontSizeMultiplier={1}
        style={[styles.hexText, { fontSize: font, color: ink }]}
        numberOfLines={1}
      >
        {hexInitials(name)}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------------------------
// ListRow

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Free-text preview; only this part may be clamped. */
  preview?: string;
  /** a lucide icon drawn in the 38pt paper tile */
  icon?: LucideIcon;
  /** a hexagon avatar with the initials of this name */
  avatar?: { name: string; tone?: HexAvatarTone };
  /** any custom leading node (wins over `icon` / `avatar`) */
  leading?: ReactNode;
  /** custom trailing node; `null` hides the default chevron of pressable rows */
  trailing?: ReactNode;
  onPress?: () => void;
  /** red title and tile, for destructive rows (Ieși din cont, Șterge contul) */
  danger?: boolean;
  /** hairline above the row (Group draws these between its rows) */
  separator?: boolean;
  /** padding 12/14 (default); false when an outer container pads the row */
  inset?: boolean;
  titleLines?: number;
  subtitleLines?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** The trailing chevron of pressable rows (handbook .li: 18pt, navy). */
export const RowChevron = ({ color = palette.navy }: { color?: string }) => (
  <ChevronRightIcon size={18} color={color} strokeWidth={ICON_STROKE} />
);

export const ListRow = ({
  title,
  subtitle,
  preview,
  icon: Icon,
  avatar,
  leading,
  trailing,
  onPress,
  danger,
  separator,
  inset = true,
  titleLines,
  subtitleLines,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ListRowProps) => {
  const { fontScale } = useWindowDimensions();
  const stackTail =
    fontScale >= 1.2 &&
    trailing != null &&
    !(React.isValidElement(trailing) && trailing.type === RowChevron);
  const lead =
    leading ??
    (Icon ? (
      <View style={[styles.tile, danger ? styles.tileDanger : null]}>
        <Icon size={20} color={danger ? palette.red : palette.navy} strokeWidth={ICON_STROKE} />
      </View>
    ) : avatar ? (
      <HexAvatar name={avatar.name} tone={avatar.tone} />
    ) : null);
  const tail =
    trailing === undefined ? (
      onPress ? (
        <RowChevron color={danger ? palette.red : undefined} />
      ) : null
    ) : (
      trailing
    );

  const content = (
    <>
      {lead}
      <View style={styles.text}>
        <Text
          numberOfLines={titleLines}
          maxFontSizeMultiplier={fontScaleCap.text}
          style={[styles.title, danger ? styles.titleDanger : null]}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            numberOfLines={subtitleLines}
            maxFontSizeMultiplier={fontScaleCap.text}
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
        {!!preview && (
          <Text numberOfLines={2} maxFontSizeMultiplier={fontScaleCap.text} style={styles.subtitle}>
            {preview}
          </Text>
        )}
        {stackTail && tail ? <View style={styles.stackedTail}>{tail}</View> : null}
      </View>
      {!stackTail && tail}
    </>
  );

  const base = [styles.row, inset ? styles.inset : null, separator ? styles.separator : null];

  if (!onPress) {
    return (
      <View testID={testID} style={[base, style]} accessibilityLabel={accessibilityLabel}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}, ${subtitle}` : title)}
      accessibilityHint={accessibilityHint}
      accessibilityState={disabled ? { disabled } : undefined}
      style={({ pressed }) => [base, pressed ? styles.pressed : null, style]}
    >
      {content}
    </Pressable>
  );
};

export default ListRow;

const styles = StyleSheet.create((theme) => ({
  hex: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  hexSvg: { position: 'absolute', top: 0, left: 0 },
  // no font padding: Bricolage's tall ascent would push the initial below the centre on Android
  hexText: { fontFamily: theme.fontFamily.display, letterSpacing: -0.3, includeFontPadding: false },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
  },
  inset: { paddingVertical: 12, paddingHorizontal: 14 },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.line },
  pressed: { backgroundColor: 'rgba(1,52,79,0.05)' },
  tile: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tileDanger: { backgroundColor: 'rgba(200,50,31,0.1)' },
  text: { flex: 1, minWidth: 0, gap: 2 },
  stackedTail: { alignSelf: 'flex-start', marginTop: 6 },
  title: {
    fontFamily: theme.fontFamily.textBold,
    fontSize: 15.5,
    lineHeight: 20,
    color: theme.colors.ink,
  },
  titleDanger: { color: theme.colors.red },
  subtitle: { ...theme.type.caption, color: theme.colors.ink2 },
}));
