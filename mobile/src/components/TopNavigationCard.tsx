import React from 'react';
import { Avatar, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';

interface TopNavigationCardProps {
  title: string;
  uri: string;
}

const TopNavigationCard = ({ title, uri }: TopNavigationCardProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <View style={styles.shadow}>
        <Avatar source={{ uri }} size="small" />
      </View>
      <Text category="h3" appearance="alternative">
        {title}
      </Text>
    </View>
  );
};

export default TopNavigationCard;

const themedStyles = StyleService.create({
  container: {
    backgroundColor: '$color-success-500',
    paddingVertical: 24,
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 12,
    borderBottomRightRadius: 40,
    width: '85%',
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
