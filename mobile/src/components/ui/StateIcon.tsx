import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, StatusTone } from '../../common/theme/tokens';

export type StateKind =
  'missing' | 'offline' | 'organizations' | 'error' | 'notifications' | 'update';

const STATE: Record<StateKind, { tone: StatusTone; path: React.ReactNode }> = {
  missing: {
    tone: 'neutral',
    path: (
      <>
        <Circle cx={11} cy={11} r={7} />
        <Path d="m20 20-4-4M8.5 8.5l5 5M13.5 8.5l-5 5" />
      </>
    ),
  },
  offline: {
    tone: 'neutral',
    path: (
      <Path d="M2 8.8a15 15 0 0 1 20 0M5 12.6a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />
    ),
  },
  organizations: {
    tone: 'accent',
    path: <Path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
  },
  error: {
    tone: 'no',
    path: (
      <>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M12 7v6M12 16.5h.01" />
      </>
    ),
  },
  notifications: {
    tone: 'wait',
    path: (
      <Path d="M6 8a6 6 0 0 1 9.3-5M18 8c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0M3 3l18 18" />
    ),
  },
  update: {
    tone: 'accent',
    path: <Path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  },
};

/** The round icon on top of the system states (canvas board "Stări"). */
export const StateIcon = ({ kind, size = 72 }: { kind: StateKind; size?: number }) => {
  const { tone, path } = STATE[kind];
  const { bg, fg } = colors.status[tone];
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
      testID={`state-icon-${kind}`}
    >
      <Svg
        width={size * 0.45}
        height={size * 0.45}
        viewBox="0 0 24 24"
        fill="none"
        stroke={fg}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {path}
      </Svg>
    </View>
  );
};

export default StateIcon;

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
