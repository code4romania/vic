import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../../common/theme/tokens';

/**
 * White rounded block that groups rows (list rows, event cards) on the tinted page background, like
 * iOS inset-grouped lists. Rows keep their own hairlines between them.
 */
export const Group = ({ style, children, ...props }: ViewProps) => (
  <View {...props} style={[styles.group, shadows.card, style]}>
    {children}
  </View>
);

/**
 * The same look for one row of a FlatList: white, rounded on the first and the last row, so the
 * whole list reads as one group.
 */
export const groupedItem = (index: number, count: number): ViewStyle[] => [
  styles.item,
  index === 0 ? styles.first : styles.middle,
  index === count - 1 ? styles.last : styles.middle,
];

export default Group;

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingHorizontal: 16,
  },
  item: { backgroundColor: colors.white, paddingHorizontal: 16, overflow: 'hidden' },
  first: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  last: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
  middle: {},
});
