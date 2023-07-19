import React from 'react';
import { Avatar, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
//SVG
import chevronRightSVG from '../assets/svg/chevron-right';
import { SvgXml } from 'react-native-svg';
import SkeletonBar from './skeleton/skeleton-bar';

interface VolunteerCardProps {
  title: string;
  onPress: () => void;
  subtitle?: string;
  uri?: string;
  icon?: ReactNode;
  loading?: boolean;
}

const VolunteerCard = ({ title, onPress, subtitle, uri, icon, loading }: VolunteerCardProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? styles.pressed : styles.notPressed)}
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
          <Text category="s1">{title}</Text>
          {subtitle && (
            <View style={styles.subtitleContainer}>
              {!loading ? (
                <>
                  <View style={styles.yellowDot} />
                  <Text status="warning" category="s2">
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

const themedStyles = StyleService.create({
  container: {
    paddingLeft: 16,
    paddingRight: 24,
    height: 75,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '$cool-gray-100',
    borderRadius: 16,
  },
  notPressed: {
    backgroundColor: '$cool-gray-50',
    borderRadius: 16,
  },
  yellowDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '$color-warning-500',
  },
});
