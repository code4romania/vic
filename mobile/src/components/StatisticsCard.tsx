import React from 'react';
import { Icon, Text, useTheme } from '@ui-kitten/components';
import { Platform, StyleSheet, TouchableHighlight, View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface StatisticsCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  backgroundColor: string;
}

const StatisticsCard = ({
  icon,
  title,
  subtitle,
  onPress,
  backgroundColor,
}: StatisticsCardProps) => {
  const theme = useTheme();

  return (
    <TouchableHighlight onPress={onPress} style={styles.touchableContainer} activeOpacity={0.9}>
      <View style={[styles.container, { backgroundColor: theme[backgroundColor] }]}>
        <Icon
          name={icon}
          style={{ ...styles.icon, color: theme['color-success-500'] }}
          fill="red"
        />
        <View style={styles.textContainer}>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3">
            {title}
          </Text>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1">
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default StatisticsCard;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 18,
    borderRadius: 16,
    width: 140,
    minHeight: 163,
    ...Platform.select({
      android: {
        elevation: 2, // Adjust the shadow elevation as desired
      },
      ios: {
        shadowColor: 'gray',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
    }),
  },
  touchableContainer: {
    borderRadius: 16,
  },
  textContainer: {
    gap: 4,
  },
  icon: {
    height: 56,
    width: 56,
  },
});
