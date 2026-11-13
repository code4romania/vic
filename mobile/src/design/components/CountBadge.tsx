// Count badge „Îndrăzneț” (prototype `.badge-n`): a red pill with a white number, ringed in paper,
// on the top-right corner of an icon button (the Home bell). Hidden at 0, „9+” above 9.
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const MAX_BADGE_COUNT = 9;

/** What the badge shows: nothing at 0, the number up to 9, „9+” above. */
export const badgeLabel = (count?: number | null): string | null => {
  if (!count || count <= 0) {
    return null;
  }
  return count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : `${count}`;
};

export interface CountBadgeProps {
  count?: number | null;
  testID?: string;
}

// The parent (the button) says the count to screen readers; the badge itself stays silent.
export const CountBadge = ({ count, testID }: CountBadgeProps) => {
  const label = badgeLabel(count);
  if (!label) {
    return null;
  }
  return (
    <View
      style={styles.badge}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      testID={testID}
    >
      <Text style={styles.text} maxFontSizeMultiplier={1.15} allowFontScaling numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

// The prototype's 2px paper ring is a box-shadow outside the 20pt pill: here it is a 2pt border
// on a 24pt pill moved out by 2pt, so the red part stays 20pt at top 2, right 0.
const RING = 2;

const styles = StyleSheet.create((theme) => ({
  badge: {
    position: 'absolute',
    top: 2 - RING,
    right: -RING,
    minWidth: 20 + RING * 2,
    height: 20 + RING * 2,
    borderRadius: 10 + RING,
    borderWidth: RING,
    borderColor: theme.colors.background,
    paddingHorizontal: 5,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 11,
    lineHeight: 14,
    color: theme.colors.white,
    includeFontPadding: false,
    textAlign: 'center',
  },
}));
