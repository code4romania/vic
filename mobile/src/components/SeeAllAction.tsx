import { Button, Text, useTheme } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useTranslation } from 'react-i18next';

interface SeeAllActionProps {
  onPress: () => void;
}

const SeeAllAction = ({ onPress }: SeeAllActionProps) => {
  const { t } = useTranslation('home');
  const theme = useTheme();
  return (
    <Button
      style={[styles.seeAllBtn, { backgroundColor: theme['color-primary-50'] }]}
      size="tiny"
      appearance="ghost"
      onPress={onPress}
    >
      {() => (
        <Text
          allowFontScaling={ALLOW_FONT_SCALLING}
          category="c2"
          style={{ color: theme['color-primary-800'] }}
        >{`${t('anouncements.section.see_all')}`}</Text>
      )}
    </Button>
  );
};

export default SeeAllAction;

const styles = StyleSheet.create({
  seeAllBtn: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});
