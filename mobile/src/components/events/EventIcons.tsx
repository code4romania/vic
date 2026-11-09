import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../common/theme/tokens';

export type EventIconName = IconName;
type IconName =
  | 'search'
  | 'filters'
  | 'open'
  | 'going'
  | 'organizations'
  | 'calendar'
  | 'pin'
  | 'people'
  | 'close'
  | 'back'
  | 'check'
  | 'target';

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m20 20-3.5-3.5" />
    </>
  ),
  filters: <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
  open: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  going: (
    <>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Path d="M3 9h18M8 2v4M16 2v4M9 15l2 2 4-4" />
    </>
  ),
  organizations: (
    <>
      <Path d="M3 21V8l6-4 6 4v13" />
      <Path d="M15 11h6v10M1 21h22M7 10h4M7 14h4M7 18h4" />
    </>
  ),
  calendar: (
    <>
      <Rect x={3} y={4} width={18} height={17} rx={2} />
      <Path d="M3 9h18M8 2v4M16 2v4" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <Circle cx={12} cy={10} r={2.5} />
    </>
  ),
  people: (
    <>
      <Circle cx={9} cy={8} r={3.5} />
      <Path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.3 3.5 5.5" />
    </>
  ),
  target: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Circle cx={12} cy={12} r={4} />
    </>
  ),
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  back: <Path d="M15 18l-6-6 6-6" />,
  check: <Path d="m5 12 5 5 9-10" />,
};

export const EventIcon = ({
  name,
  size = 22,
  color = colors.ink,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths[name]}
  </Svg>
);

export default EventIcon;
