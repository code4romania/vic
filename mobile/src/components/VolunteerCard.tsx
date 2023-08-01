import React from 'react';
import { Avatar, Text, useTheme } from '@ui-kitten/components';
import { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Pressable } from 'react-native';
//SVG
import chevronRightSVG from '../assets/svg/chevron-right';
import { SvgXml } from 'react-native-svg';
import SkeletonBar from './skeleton/skeleton-bar';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface VolunteerCardProps {
  title: string;
  onPress: () => void;
  subtitle?: string;
  uri?: string;
  icon?: ReactNode;
  loading?: boolean;
}

const VolunteerCard = ({ title, onPress, subtitle, uri, icon, loading }: VolunteerCardProps) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        pressed
          ? { ...styles.pressed, backgroundColor: theme['cool-gray-100'] }
          : { ...styles.notPressed, backgroundColor: theme['cool-gray-50'] }
      }
    >
      <View style={styles.container}>
        {uri && (
          <View style={styles.shadow}>
            <Avatar
              source={{
                uri,
              }}
              size="small"
            />
          </View>
        )}
        {icon}
        <View style={styles.textContainer}>
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="s1">
            {title}
          </Text>
          {subtitle && (
            <View style={styles.subtitleContainer}>
              {!loading ? (
                <>
                  <View
                    style={{ ...styles.yellowDot, backgroundColor: theme['color-warning-500'] }}
                  />
                  <Text allowFontScaling={ALLOW_FONT_SCALLING} status="warning" category="s2">
                    {subtitle}
                  </Text>
                </>
              ) : (
                <SkeletonBar />
              )}
            </View>
          )}
        </View>
        <SvgXml xml={chevronRightSVG} style={styles.chevronRight} />
      </View>
    </Pressable>
  );
};

export default VolunteerCard;

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 24,
    height: 75,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  shadow: {
    ...Platform.select({
      android: {
        elevation: 2, // Adjust the shadow elevation as desired
      },
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
    }),
  },
  textContainer: {
    gap: 4,
  },
  subtitleContainer: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronRight: {
    marginLeft: 'auto',
  },
  pressed: {
    borderRadius: 16,
  },
  notPressed: {
    borderRadius: 16,
  },
  yellowDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
});
