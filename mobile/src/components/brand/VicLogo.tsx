import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

/** The VIC hexagon mark (dark octagon with the yellow V). */
export const VicLogo = ({ size = 88, dark = '#231F20' }: { size?: number; dark?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="VIC">
    <Polygon points="28,2 72,2 98,30 92,78 64,98 36,98 8,78 2,30" fill={dark} />
    <Polygon points="26,24 42,24 50,58 58,24 74,24 58,76 42,76" fill="#FFD209" />
  </Svg>
);

export default VicLogo;
