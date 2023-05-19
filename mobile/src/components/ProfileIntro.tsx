import { Text } from '@ui-kitten/components';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ProfileIntroProps {
  uri: string;
  name: string;
  description: string;
}

const ProfileIntro = ({ uri, name, description }: ProfileIntroProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri }} style={styles.profileImage} />
      </View>
      <View style={styles.textContainer}>
        <Text category="h3">{name}</Text>
        <Text category="c1" appearance="hint" style={styles.description}>
          {description}
        </Text>
      </View>
    </View>
  );
};

export default ProfileIntro;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  textContainer: {
    gap: 16,
  },
  imageWrapper: {
    shadowColor: '$dark-purple',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImage: {
    borderRadius: 70,
    width: 138,
    height: 138,
  },
  description: {
    lineHeight: 20,
  },
});
