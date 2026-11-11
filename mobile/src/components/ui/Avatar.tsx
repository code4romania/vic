import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { VText } from './VText';
import { colors } from '../../common/theme/tokens';

export interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  /** Organizations use rounded squares, people use circles. */
  shape?: 'circle' | 'rounded';
  /** on the gray canvas the navy tint of an organization blends in: use a white tile instead */
  onCanvas?: boolean;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

// The line height follows the font size and leaves room for diacritics (Ș, Ț), so big initials
// aren't cut by the variant's fixed line height.
const initialsStyle = (size: number) => {
  const fontSize = Math.max(12, size * 0.36);
  return { fontSize, lineHeight: Math.round(fontSize * 1.3) };
};

/**
 * Photo or logo, falling back to initials: people get navy with yellow initials (canvas "Profil"),
 * organizations a navy tint with navy initials.
 */
export const Avatar = ({ name, uri, size = 40, shape = 'circle', onCanvas }: AvatarProps) => {
  const borderRadius = shape === 'circle' ? size / 2 : Math.round(size * 0.3);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius }}
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel={name}
      />
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={name}
      style={[
        styles.fallback,
        shape === 'circle' ? styles.person : styles.organization,
        onCanvas && shape === 'rounded' ? styles.canvas : null,
        { width: size, height: size, borderRadius },
      ]}
    >
      <VText
        variant="h3"
        color={shape === 'circle' ? colors.yellow : colors.navy}
        style={initialsStyle(size)}
        maxFontSizeMultiplier={1.2}
      >
        {initials(name)}
      </VText>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  person: { backgroundColor: colors.navy },
  organization: { backgroundColor: colors.navyTint },
  canvas: { backgroundColor: colors.white },
});
