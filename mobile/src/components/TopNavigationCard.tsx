import React from 'react';
import { Avatar, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Pressable, View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopNavigationCardProps {
  title: string;
  uri: string;
  onPress: () => void;
}

const TopNavigationCard = ({ title, uri, onPress }: TopNavigationCardProps) => {
  const styles = useStyleSheet(themedStyles);
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={[styles.header, { height: insets.top + 6 }]} />
      <View style={styles.row}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) =>
            pressed ? [styles.pressed, styles.container] : [styles.notPressed, styles.container]
          }
        >
          <View style={styles.elipsis} />
          <View style={styles.shadow}>
            <Avatar source={{ uri }} size="small" />
          </View>
          <Text
            style={styles.title}
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="h3"
            appearance="alternative"
          >
            {title}
          </Text>
        </Pressable>
        <View style={styles.backdropBox}>
          <View style={styles.whiteBox} />
        </View>
      </View>
    </>
  );
};

export default TopNavigationCard;

const themedStyles = StyleService.create({
  header: {
    backgroundColor: '$cool-gray-800',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  elipsis: {
    backgroundColor: '$color-primary-500',
    height: 16,
    width: 16,
    borderRadius: 100,
    position: 'relative',
    left: -24,
  },
  notPressed: {
    backgroundColor: '$cool-gray-800',
  },
  pressed: {
    backgroundColor: '$cool-gray-700',
  },
  container: {
    paddingVertical: 24,
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 12,
    borderBottomRightRadius: 40,
    width: '85%',
    alignItems: 'center',
  },
  shadow: {
    elevation: 4,
    shadowColor: '$dark-purple',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
  title: {
    flexWrap: 'wrap',
    maxWidth: '85%',
  },
  backdropBox: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  whiteBox: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
  },
});
