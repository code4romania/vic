// Group „Îndrăzneț”: a white block (radius 24, overflow hidden) that holds rows on the paper
// background. Rows are separated by a hairline, drawn here so rows stay unaware of their position.
import React, { Children, Fragment, isValidElement, ReactNode } from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface GroupProps extends ViewProps {
  children?: ReactNode;
  /** hairline between rows (default true) */
  separators?: boolean;
  /** horizontal padding inside the group, for content that does not pad itself */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Group = ({
  children,
  separators = true,
  padded = false,
  style,
  ...props
}: GroupProps) => {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View {...props} style={[styles.group, padded ? styles.padded : null, style]}>
      {separators
        ? items.map((child, index) => (
            <Fragment key={child.key ?? index}>
              {index > 0 && <View style={styles.line} />}
              {child}
            </Fragment>
          ))
        : children}
    </View>
  );
};

export default Group;

const styles = StyleSheet.create((theme) => ({
  group: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },
  padded: { paddingHorizontal: theme.space.l },
  // 1pt line, like the prototype (`border-top:1px solid var(--line)`)
  line: { height: 1, backgroundColor: theme.colors.line },
}));
