import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../../common/theme/tokens';
import { MAX_FONT_SCALE } from '../../common/constants/constants';

export type TextVariant = keyof typeof typography;

export interface VTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

const TITLE_VARIANTS: TextVariant[] = ['largeTitle', 'h2'];

/**
 * Text with the VIC 2.0 type scale (Titillium Web titles, Roboto body). It follows the system text
 * size (accessibility), capped so the layouts hold.
 */
export const VText = ({ variant = 'body', color, style, ...props }: VTextProps) => (
  <Text
    allowFontScaling
    maxFontSizeMultiplier={
      TITLE_VARIANTS.includes(variant) ? MAX_FONT_SCALE.title : MAX_FONT_SCALE.text
    }
    {...props}
    style={[typography[variant], color ? { color } : null, style]}
  />
);

export default VText;
