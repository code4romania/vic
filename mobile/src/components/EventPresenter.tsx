import { Text } from '@ui-kitten/components';
import React from 'react';
import { Image, StyleSheet, TouchableHighlight, View } from 'react-native';
//SVG
import clockSvg from '../assets/svg/clock';
import locationSvg from '../assets/svg/location';
import usersSvg from '../assets/svg/users';
import { SvgXml } from 'react-native-svg';
import IconSvg from './IconSvg';

interface EventPresenterProps {
  title: string;
  date: string;
  location: string;
  divison: string;
  onPress: () => void;
}

const EventPresenter = ({ title, date, location, divison, onPress }: EventPresenterProps) => {
  return (
    <TouchableHighlight onPress={onPress} underlayColor="#F9F9F9">
      <View style={styles.container}>
        <Image source={{ uri: 'https://picsum.photos/200' }} style={styles.eventImg} />
        <View style={styles.textContainer}>
          <Text category="p2">{title}</Text>
          <View style={styles.section}>
            <IconSvg icon={clockSvg} size={10} fill="#9CA3AF" />
            <Text category="c1" appearance="hint">
              {date}
            </Text>
          </View>
          <View style={styles.section}>
            <SvgXml xml={locationSvg} />
            <Text category="c1" appearance="hint">
              {location}
            </Text>
          </View>
          <View style={styles.section}>
            <SvgXml xml={usersSvg} />
            <Text category="c1" appearance="hint">
              {divison}
            </Text>
          </View>
        </View>
        <Image source={{ uri: 'https://picsum.photos/200' }} style={styles.organizationImg} />
      </View>
    </TouchableHighlight>
  );
};

export default EventPresenter;

const styles = StyleSheet.create({
  container: {
    gap: 16,
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '$cool-gray-200',
  },
  section: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  eventImg: {
    width: 48,
    height: 48,
    borderRadius: 100,
  },
  organizationImg: {
    borderRadius: 100,
    width: 24,
    height: 24,
  },
  textContainer: {
    flex: 1,
  },
});
