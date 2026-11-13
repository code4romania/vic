import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { palette } from '../../design/tokens';

export interface StripedSquareProps {
  size?: number;
  /** stripe period across the stripes (CSS `repeating-linear-gradient(135deg, a 0 p/2, b p/2 p)`) */
  period?: number;
  stripe?: string;
  background?: string;
  radius?: number;
  testID?: string;
}

/**
 * A rounded square with „/” diagonal stripes, drawn as plain polygons in a clipped View.
 * (An SVG `<Pattern patternTransform="rotate(45)">` renders as a few dots on iOS at this size.)
 */
export const StripedSquare = ({
  size = 12,
  period = 6,
  stripe = palette.navy,
  background = palette.white,
  radius = 4,
  testID,
}: StripedSquareProps) => {
  // bands of constant x + y; one period across the stripes is period·√2 along x + y
  const step = period * Math.SQRT2;
  let d = '';
  for (let a = 0; a < size * 2; a += step) {
    const b = a + step / 2;
    d += `M${a.toFixed(2)} 0L${b.toFixed(2)} 0L0 ${b.toFixed(2)}L0 ${a.toFixed(2)}Z`;
  }
  return (
    <View
      testID={testID}
      style={[styles.clip, { width: size, height: size, borderRadius: radius }]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill={background} />
        <Path d={d} fill={stripe} />
      </Svg>
    </View>
  );
};

export default StripedSquare;

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
