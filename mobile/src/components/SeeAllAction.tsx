import React from 'react';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { AppText } from '../design/components/Text';
import { ChevronRightIcon } from '../design/icons';
import { palette } from '../design/tokens';

interface SeeAllActionProps {
  onPress: () => void;
}

/** "Vezi tot" pill: white, navy label and chevron, 44pt touch area. */
const SeeAllAction = ({ onPress }: SeeAllActionProps) => {
  const { t } = useTranslation('home');
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" style={styles.seeAllBtn}>
      <AppText variant="label">{`${t('anouncements.section.see_all')}`}</AppText>
      <ChevronRightIcon size={16} color={palette.navy} strokeWidth={2.4} />
    </Pressable>
  );
};

export default SeeAllAction;

const styles = StyleSheet.create((theme) => ({
  seeAllBtn: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: theme.radius.pill,
    paddingLeft: 12,
    paddingRight: 8,
    backgroundColor: theme.colors.card,
  },
}));
