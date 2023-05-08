import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import React from 'react';
import { Image, View } from 'react-native';

interface ProfileIntroProps {
  uri: string;
  name: string;
  description: string;
}

const ProfileIntro = ({ uri, name, description }: ProfileIntroProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri }} style={styles.profileImage} />
      </View>
      <View style={styles.textContainer}>
        <Text category="h2">{name}</Text>
        <Text category="c1" appearance="hint">
          {description}
        </Text>
      </View>
    </View>
  );
};

export default ProfileIntro;

const themedStyles = StyleService.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  textContainer: {
    gap: 16,
  },
  imageWrapper: {
    shadowColor: '#303C6C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileImage: {
    borderRadius: 70,
    width: 138,
    height: 138,
  },
});
