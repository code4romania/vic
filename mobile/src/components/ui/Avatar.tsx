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
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

/** Photo or logo, falling back to initials on a soft background. */
export const Avatar = ({ name, uri, size = 40, shape = 'circle' }: AvatarProps) => {
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
      style={[styles.fallback, { width: size, height: size, borderRadius }]}
    >
      <VText variant="h3" color={colors.navy} style={{ fontSize: Math.max(12, size * 0.36) }}>
        {initials(name)}
      </VText>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
});
