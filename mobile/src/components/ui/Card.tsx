import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, shadows } from '../../common/theme/tokens';
import { PressableScale } from './PressableScale';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** White card, radius 16, soft layered shadow. Pressable when `onPress` is set. */
export const Card = ({ onPress, style, children, accessibilityLabel, ...props }: CardProps) =>
  onPress ? (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.card, style]}
      testID={props.testID}
    >
      {children}
    </PressableScale>
  ) : (
    <View {...props} style={[styles.card, style]}>
      {children}
    </View>
  );

export default Card;

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.card, ...shadows.card },
});
