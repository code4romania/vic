import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface AppleButtonProps {
  onPress: () => void;
}

const AppleButton = ({ onPress }: AppleButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.btnContainer}>
        <Image
          source={require('../assets/images/social/apple/apple-icon.png')}
          style={styles.image}
        />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.textStyle} category="p2">
          Sign in with Apple
        </Text>
      </View>
    </Pressable>
  );
};

export default AppleButton;

const styles = StyleSheet.create({
  btnContainer: {
    height: 44,
    width: '100%',
    maxWidth: 240,
    flexDirection: 'row',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
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
  image: { width: 34, height: 40 },
  textStyle: { fontSize: 14, lineHeight: 14, color: 'white' },
});
