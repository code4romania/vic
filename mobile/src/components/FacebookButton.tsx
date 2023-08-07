import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface FacebookButtonProps {
  onPress: () => void;
}

const FacebookButton = ({ onPress }: FacebookButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.btnContainer}>
        <Image
          source={require('../assets/images/social/facebook/facebook.png')}
          style={styles.image}
        />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.textStyle} category="p2">
          Login with Facebook
        </Text>
      </View>
    </Pressable>
  );
};

export default FacebookButton;

const styles = StyleSheet.create({
  btnContainer: {
    height: 44,
    width: '100%',
    maxWidth: 240,
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    alignItems: 'center',
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
  image: { width: 32, height: 32, marginVertical: 8, marginHorizontal: 8 },
  textStyle: { fontSize: 14, color: 'white' },
});
