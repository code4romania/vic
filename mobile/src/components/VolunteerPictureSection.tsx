import React from 'react';
import { Image, ImageStyle } from 'react-native';
import i18n from '../common/config/i18n';
import { View } from 'react-native';
import { Button, StyleService, Text, useStyleSheet } from '@ui-kitten/components';

const VolunteerPictureSection = () => {
  const styles = useStyleSheet(themedStyles);

  const onChangePicturePress = () => {
    console.log('change picture');
  };

  return (
    <View style={styles.container}>
      <Text>{`${i18n.t('settings:account_data.picture')}`}</Text>
      <View style={styles.wrapper}>
        <Image source={{ uri: 'https://picsum.photos/200' }} style={styles.image as ImageStyle} />
        <Button
          onPress={onChangePicturePress}
          status="basic"
          appearance="outline"
          style={styles.button}
        >
          {() => <Text category="p2">{`${i18n.t('settings:account_data.change_picture')}`}</Text>}
        </Button>
      </View>
    </View>
  );
};

export default VolunteerPictureSection;

const themedStyles = StyleService.create({
  container: {
    gap: 4,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '$cool-gray-200',
  },
  wrapper: {
    paddingVertical: 8,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});
