import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconSvgProps {
  size?: number;
  icon: string | null;
}

const IconSvg = ({ icon, size }: IconSvgProps) => <SvgXml xml={icon} width={size} height={size} />;

export default IconSvg;
