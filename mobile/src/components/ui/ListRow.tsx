import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { ListRow as DesignListRow, RowChevron } from '../../design/components/ListRow';
import { palette as colors } from '../../design/tokens';
import { useGroupInset } from './Group';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  preview?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Hairline under the row, as in iOS settings lists. */
  divider?: boolean;
  destructive?: boolean;
  /** cap long texts (e.g. an announcement on Acasă); unlimited by default */
  titleLines?: number;
  subtitleLines?: number;
  testID?: string;
}

export const Chevron = RowChevron;

/**
 * Settings-style row, legacy API over the „Îndrăzneț” ListRow (60pt, Manrope 700 15.5 title,
 * pressed tint). Inside a Group it bleeds over the group padding so the press fills the width.
 */
export const ListRow = ({
  title,
  subtitle,
  preview,
  leading,
  trailing,
  onPress,
  divider = true,
  destructive,
  titleLines,
  subtitleLines,
  testID,
}: ListRowProps) => {
  const inset = useGroupInset();
  return (
    <DesignListRow
      title={title}
      subtitle={subtitle}
      preview={preview}
      leading={leading}
      trailing={trailing}
      onPress={onPress}
      danger={destructive}
      titleLines={titleLines}
      subtitleLines={subtitleLines}
      accessibilityLabel={title}
      testID={testID}
      inset={inset > 0}
      style={[
        inset > 0 ? { marginHorizontal: -inset } : styles.bare,
        divider ? styles.divider : null,
      ]}
    />
  );
};

export default ListRow;

const styles = StyleSheet.create({
  // outside a Group the parent pads the row horizontally
  bare: { paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});
