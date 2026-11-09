import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'home' | 'events' | 'hours' | 'documents' | 'profile';

interface TabIconProps {
  name: TabIconName;
  color: string;
  active?: boolean;
  size?: number;
}

/** Outline icons from the canvas tab bar; the active tab draws a thicker stroke. */
export const TabIcon = ({ name, color, active, size = 22 }: TabIconProps) => {
  const stroke = {
    stroke: color,
    strokeWidth: active ? 2.4 : 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path d="M3 10.5 12 3l9 7.5V21H3z" {...stroke} />}
      {name === 'events' && (
        <>
          <Rect x={3} y={4} width={18} height={17} rx={2} {...stroke} />
          <Path d="M3 9h18M8 2v4M16 2v4" {...stroke} />
        </>
      )}
      {name === 'hours' && (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M12 7v5l3 2" {...stroke} />
        </>
      )}
      {name === 'documents' && (
        <>
          <Path d="M14 3H6v18h12V7z" {...stroke} />
          <Path d="M14 3v4h4" {...stroke} />
        </>
      )}
      {name === 'profile' && (
        <>
          <Circle cx={12} cy={8} r={4} {...stroke} />
          <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" {...stroke} />
        </>
      )}
    </Svg>
  );
};

export default TabIcon;
