import { Text, useTheme } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { View, Image, ImageStyle, StyleSheet } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface NewsListItemProps {
  icon: string;
  title?: string;
  subtitle?: string;
  subtitleElement?: ReactNode;
  onPress?: () => void;
}

const NewsListItem = ({ icon, title, subtitle, onPress, subtitleElement }: NewsListItemProps) => {
  const theme = useTheme();
  return (
    <TouchableHighlight onPress={onPress} style={styles.touchableContainer} activeOpacity={0.9}>
      <View style={{ ...styles.container, backgroundColor: theme['cool-gray-50'] }}>
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
            <Text allowFontScaling={ALLOW_FONT_SCALLING} category="s1" numberOfLines={2}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              allowFontScaling={ALLOW_FONT_SCALLING}
              category="c1"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ ...styles.subtitle, color: theme['cool-gray-500'] }}
            >
              {subtitle}
            </Text>
          )}
          {subtitleElement}
        </View>
      </View>
    </TouchableHighlight>
  );
};

export default NewsListItem;

const styles = StyleSheet.create({
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
