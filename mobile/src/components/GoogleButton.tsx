import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface GoogleButtonProps {
  onPress: () => void;
}

const GoogleButton = ({ onPress }: GoogleButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.btnContainer}>
        <Image
          source={require('../assets/images/social/google/google-dark.png')}
          style={styles.image}
        />
        <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.textStyle} category="p2">
          Sign in with Google
        </Text>
      </View>
    </Pressable>
  );
};

export default GoogleButton;

const styles = StyleSheet.create({
  btnContainer: {
    height: 44,
    width: '100%',
    maxWidth: 240,
    flexDirection: 'row',
    backgroundColor: '#1877F2',
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
  image: { width: 44, height: 44, margin: 0 },
  textStyle: { fontSize: 14, color: 'white' },
});
