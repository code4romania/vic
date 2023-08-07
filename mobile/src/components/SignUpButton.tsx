import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useTranslation } from 'react-i18next';

interface SignUpButtonProps {
  onPress: () => void;
}

const SignUpButton = ({ onPress }: SignUpButtonProps) => {
  const { t } = useTranslation('landing');
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.btnContainer, { backgroundColor: theme['turquoise-700'] }]}>
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.textStyle} category="p2">
          {`${t('email')}`}
        </Text>
      </View>
    </Pressable>
  );
};

export default SignUpButton;

const styles = StyleSheet.create({
  btnContainer: {
    height: 44,
    width: '100%',
    maxWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    shadowColor: 'gray',
    ...Platform.select({
      android: { elevation: 5 },
      ios: {
        shadowOffset: { width: 2, height: 2.5 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
    }),
  },
  image: { width: 44, height: 44, margin: 0 },
  textStyle: { fontSize: 14, color: 'white' },
});
