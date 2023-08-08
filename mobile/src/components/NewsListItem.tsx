import { Text, useTheme } from '@ui-kitten/components';
import React, { ReactNode, useState } from 'react';
import { View, Image, ImageStyle, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface NewsListItemProps {
  icon: string;
  title?: string;
  subtitle?: string;
  subtitleElement?: ReactNode;
  expandable?: boolean;
  onPress?: () => void;
}

const NewsListItem = ({
  expandable,
  icon,
  title,
  subtitle,
  onPress,
  subtitleElement,
}: NewsListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const animationValue = new Animated.Value(0);
  const theme = useTheme();

  const toggleExpansion = () => {
    const initialValue = expanded ? 0 : 1;
    const finalValue = expanded ? 1 : 0;

    animationValue.setValue(initialValue);
    Animated.timing(animationValue, {
      toValue: finalValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  const animatedHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [76, 200], // Adjust this value as needed
  });

  const onNewsItemPress = () => {
    if (expandable) {
      toggleExpansion();
    }

    onPress && onPress();
  };

  return (
    <Pressable onPress={onNewsItemPress} style={styles.touchableContainer}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme['cool-gray-50'] },
          { height: animatedHeight },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Image
            source={{
              uri: icon,
            }}
            style={styles.image as ImageStyle}
          />
        </View>
        <View style={styles.textContainer}>
          {title && (
            <Text
              onPress={onNewsItemPress}
              allowFontScaling={ALLOW_FONT_SCALLING}
              category="s1"
              numberOfLines={1}
              suppressHighlighting
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              allowFontScaling={ALLOW_FONT_SCALLING}
              category="c1"
              numberOfLines={!expanded ? 1 : 50}
              ellipsizeMode="tail"
              style={{ ...styles.subtitle, color: theme['cool-gray-500'] }}
            >
              {subtitle}
            </Text>
          )}
          {subtitleElement}
        </View>
      </Animated.View>
    </Pressable>
  );
};
export default NewsListItem;

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: 16,
  },
  container: {
    overflow: 'hidden',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
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
  image: {
    width: 32,
    height: 32,
    borderRadius: 32,
  },
  subtitle: {
    paddingRight: 32,
    lineHeight: 20,
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
});
