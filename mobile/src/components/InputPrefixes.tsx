import { Icon, useTheme } from '@ui-kitten/components';
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

export const renderPasswordEyeIcon = (props: any): React.ReactElement => (
  <Pressable onPress={props.setSecureTextEntry.bind(null, !props.secureTextEntry)}>
    <Icon {...props} name={props.secureTextEntry ? 'eye-off' : 'eye'} />
  </Pressable>
);

export const renderPhoneNumberPrefix = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  return (
    <View
      style={{
        ...styles.phonePrefix,
        borderRightColor: theme['cool-gray-300'],
      }}
    >
      <Text allowFontScaling={ALLOW_FONT_SCALLING} appearance="hint">
        +40
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  phonePrefix: {
    borderRightWidth: 1,
    paddingRight: 6,
  },
});
