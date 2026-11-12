// Text „Îndrăzneț”: one component for the whole type scale (Bricolage for numbers and titles,
// Manrope for the rest). Dynamic Type: text grows to 1.35×, display and largeTitle stop at 1.15×.
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { fontScaleCap, type, TypeVariant } from '../tokens';

export interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  /** text color; defaults to the theme ink */
  color?: string;
}

const DISPLAY_VARIANTS: TypeVariant[] = ['display', 'largeTitle'];

export const maxScaleFor = (variant: TypeVariant) =>
  DISPLAY_VARIANTS.includes(variant) ? fontScaleCap.display : fontScaleCap.text;

export const AppText = ({ variant = 'body', color, style, ...props }: AppTextProps) => (
  <Text
    allowFontScaling
    maxFontSizeMultiplier={maxScaleFor(variant)}
    {...props}
    style={[styles.base, type[variant] as TextStyle, color ? { color } : null, style]}
  />
);

export default AppText;

const styles = StyleSheet.create((theme) => ({
  base: { color: theme.colors.text },
}));
