import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from '../../common/theme/tokens';
import { MAX_FONT_SCALE } from '../../common/constants/constants';
import { trimStyleFor, useEffectiveFontScale } from '../../design/components/Text';

export type TextVariant = keyof typeof typography;

export interface VTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  /** keep tight Bricolage titles unclipped at their designed line height (see AppText) */
  trim?: boolean;
}

const TITLE_VARIANTS: TextVariant[] = ['largeTitle', 'h2'];

/**
 * Text with the older VIC 2.0 variant names, drawn with the „Îndrăzneț” type scale (largeTitle,
 * h2 = title, …). Prefer AppText in new code. It follows the system text size, capped so the
 * layouts hold, and trims tight Bricolage titles like AppText.
 */
export const VText = ({
  variant = 'body',
  color,
  style,
  trim = true,
  maxFontSizeMultiplier,
  allowFontScaling = true,
  ...props
}: VTextProps) => {
  const cap =
    maxFontSizeMultiplier ??
    (TITLE_VARIANTS.includes(variant) ? MAX_FONT_SCALE.title : MAX_FONT_SCALE.text);
  const scale = useEffectiveFontScale(cap, allowFontScaling);
  const trimStyle = trim ? trimStyleFor([typography[variant] as TextStyle, style], scale) : null;
  return (
    <Text
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={cap}
      {...props}
      style={[typography[variant], color ? { color } : null, style, trimStyle]}
    />
  );
};

export default VText;
