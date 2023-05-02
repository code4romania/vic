import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconSvgProps {
  size?: number;
  icon: string | null;
  fill?: string;
}

const IconSvg = ({ icon, size, fill = '#9CA3AF', ...svgProps }: IconSvgProps) => (
  <SvgXml xml={icon} width={size} height={size} fill={fill} {...svgProps} />
);

export default IconSvg;
