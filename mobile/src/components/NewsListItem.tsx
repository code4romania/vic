import { Text, withStyles } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { applyCardShadow } from '../common/utils/utils';

interface NewsListItemProps {
  icon: ReactNode;
  title?: string;
  subtitle?: string;
  eva?: any;
  onPress?: () => void;
}

const NewsListItem = ({ icon, title, subtitle, eva, onPress }: NewsListItemProps) => {
  return (
    <TouchableHighlight onPress={onPress} style={eva.style.touchableContainer}>
      <View style={eva?.style.container}>
        <View style={eva?.style.iconWrapper}>{icon}</View>
        <View style={eva?.style.textContainer}>
          <Text category="s1">{title}</Text>
          <Text category="c1" style={eva?.style.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default withStyles(NewsListItem, (theme) => ({
  touchableContainer: {
    borderRadius: 16,
  },
  container: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme['cool-gray-50'],
    borderRadius: 16,
    ...applyCardShadow(theme),
  },
  subtitle: {
    color: theme['cool-gray-500'],
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 6,
  },
}));
