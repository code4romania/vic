import React, { createContext, useContext } from 'react';
import { StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { Group as DesignGroup } from '../../design/components/Group';
import { palette as colors, radius, space } from '../../design/tokens';

/** Horizontal padding of the legacy Group; rows inside bleed over it so their press fills the width. */
const GROUP_INSET = space.l;
const GroupInsetContext = createContext(0);

/** The horizontal padding of the Group around this row (0 outside a Group). */
export const useGroupInset = () => useContext(GroupInsetContext);

/**
 * White block (radius 24, overflow hidden) that groups rows and event cards on the paper
 * background. Legacy API over the „Îndrăzneț” Group: it pads its content (event cards, info rows
 * expect it) and the rows keep their own hairlines (`divider`).
 */
export const Group = ({ style, children, ...props }: ViewProps) => (
  <GroupInsetContext.Provider value={GROUP_INSET}>
    <DesignGroup {...props} separators={false} padded style={style}>
      {children}
    </DesignGroup>
  </GroupInsetContext.Provider>
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
  item: { backgroundColor: colors.card, paddingHorizontal: GROUP_INSET, overflow: 'hidden' },
  first: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  last: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card },
  middle: {},
});
