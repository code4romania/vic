import { Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View, Image, ImageStyle } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { applyCardShadow } from '../common/utils/utils';
import { Platform } from 'react-native';

interface NewsListItemProps {
  icon: string;
  title?: string;
  subtitle?: string;
  eva?: any;
  onPress?: () => void;
}

const NewsListItem = ({ icon, title, subtitle, eva, onPress }: NewsListItemProps) => {
  return (
    <TouchableHighlight onPress={onPress} style={eva.style.touchableContainer}>
      <View style={eva?.style.container}>
        <View style={eva?.style.iconWrapper}>
          <Image
            source={{
              uri: icon,
            }}
            style={eva?.style.image as ImageStyle}
          />
        </View>
        <View style={eva?.style.textContainer}>
          <Text category="s1">{title}</Text>
          <Text category="c1" numberOfLines={1} ellipsizeMode="tail" style={eva?.style.subtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default withStyles(NewsListItem, (theme) => ({
  image: {
    width: 32,
    height: 32,
    borderRadius: 32,
  },
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
    paddingRight: 32,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        elevation: 5, // Adjust the shadow elevation as desired
      },
      ios: {
        shadowColor: 'gray',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  textContainer: {
    gap: 6,
    lineHeight: 20,
  },
}));
