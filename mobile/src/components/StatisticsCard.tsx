import React, { ReactNode } from 'react';
import { Text, useTheme, withStyles } from '@ui-kitten/components';
import { TouchableHighlight, View } from 'react-native';
import { applyCardShadow } from '../common/utils/utils';

interface StatisticsCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  backgroundColor: string;
  eva?: any;
}

const StatisticsCard = ({
  icon,
  title,
  subtitle,
  onPress,
  backgroundColor,
  eva,
}: StatisticsCardProps) => {
  const theme = useTheme();

  return (
    <TouchableHighlight onPress={onPress} style={eva.style.touchableContainer}>
      <View style={[eva.style.container, { backgroundColor: theme[backgroundColor] }]}>
        {icon}
        <View style={eva.style.textContainer}>
          <Text category="h3">{title}</Text>
          <Text category="c1">{subtitle}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default withStyles(StatisticsCard, (theme) => ({
  container: {
    padding: 16,
    gap: 18,
    borderRadius: 16,
    width: 140,
    ...applyCardShadow(theme),
  },
  touchableContainer: {
    borderRadius: 16,
  },
  textContainer: {
    gap: 4,
  },
}));
