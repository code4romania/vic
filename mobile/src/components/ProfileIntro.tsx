import { Icon, Text, useTheme } from '@ui-kitten/components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImageWithPreload from './ImageWithPreload';

interface ProfileIntroProps {
  uri: string;
  name: string;
  description: string;
}

const ProfileIntro = ({ uri, name, description }: ProfileIntroProps) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        {uri ? (
          <ImageWithPreload source={uri} styles={styles.profileImage} />
        ) : (
          <View
            style={{
              ...styles.profileImage,
              borderColor: theme['cool-gray-200'],
              backgroundColor: theme['cool-gray-100'],
            }}
          >
            <Icon name="user" style={{ ...styles.icon, color: theme['cool-gray-500'] }} />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text category="h3" numberOfLines={3} ellipsizeMode="tail">
          {name}
        </Text>
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
    flexShrink: 2,
  },
  imageWrapper: {
    borderRadius: 100,
  },
  profileImage: {
    borderRadius: 70,
    width: 138,
    height: 138,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    lineHeight: 20,
  },
  icon: {
    width: 48,
    height: 48,
  },
});
