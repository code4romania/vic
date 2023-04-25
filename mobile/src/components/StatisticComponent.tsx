import React, { ReactNode } from 'react';
import { Text, useTheme } from '@ui-kitten/components';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface StatisticComponentProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  backgroundColor: string;
}

const StatisticComponent = ({
  icon,
  title,
  subtitle,
  onPress,
  backgroundColor,
}: StatisticComponentProps) => {
  const theme = useTheme();

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.container, { backgroundColor: theme[backgroundColor] }]}>
        {icon}
        <View style={styles.textContainer}>
          <Text category="h3">{title}</Text>
          <Text category="c1">{subtitle}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 18,
    borderRadius: 16,
    width: 140,
  },
  textContainer: {
    gap: 4,
  },
});

export default StatisticComponent;
