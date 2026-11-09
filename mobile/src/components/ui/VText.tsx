import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../../common/theme/tokens';
import { ALLOW_FONT_SCALLING } from '../../common/constants/constants';

export type TextVariant = keyof typeof typography;

export interface VTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
}

/** Text with the VIC 2.0 type scale (Titillium Web titles, Roboto body). */
export const VText = ({ variant = 'body', color, style, ...props }: VTextProps) => (
  <Text
    allowFontScaling={ALLOW_FONT_SCALLING}
    {...props}
    style={[typography[variant], color ? { color } : null, style]}
  />
);

export default VText;
