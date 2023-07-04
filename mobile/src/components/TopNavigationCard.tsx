import React from 'react';
import { Avatar, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Pressable, View } from 'react-native';

interface TopNavigationCardProps {
  title: string;
  uri: string;
  onPress: () => void;
}

const TopNavigationCard = ({ title, uri, onPress }: TopNavigationCardProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        pressed
          ? [styles.pressed, styles.container, styles.shadow]
          : [styles.notPressed, styles.container, styles.shadow]
      }
    >
      <View style={styles.shadow}>
        <Avatar source={{ uri }} size="small" />
      </View>
      <Text category="h3" appearance="alternative">
        {title}
      </Text>
    </Pressable>
  );
};

export default TopNavigationCard;

const themedStyles = StyleService.create({
  notPressed: {
    backgroundColor: '$color-success-500',
  },
  pressed: {
    backgroundColor: '$color-success-700',
  },
  container: {
    paddingVertical: 24,
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 12,
    borderBottomRightRadius: 40,
    width: '85%',
    alignItems: 'center',
  },
  shadow: {
    elevation: 4,
    shadowColor: '$dark-purple',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
});
