import { Text } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface NewsListItemProps {
  icon: ReactNode;
  title?: string;
  subtitle?: string;
}

const NewsListItem = ({ icon, title, subtitle }: NewsListItemProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.textContainer}>
        <Text category="s1">{title}</Text>
        <Text category="c1" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  textContainer: {
    gap: 6,
  },
  subtitle: {
    color: '#6B7280',
  },
});

export default NewsListItem;
