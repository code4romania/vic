import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import React from 'react';
import { Image, ImageStyle, View } from 'react-native';

interface OrganizationIdentityProps {
  name: string;
  uri: string;
}

const OrganizationIdentity = ({ name, uri }: OrganizationIdentityProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image as ImageStyle} />
      <Text>{name}</Text>
    </View>
  );
};

export default OrganizationIdentity;

const themedStyles = StyleService.create({
  image: { width: 32, height: 32, borderRadius: 32, borderWidth: 1, borderColor: '$cool-gray-200' },
  container: { gap: 4, flexDirection: 'row', alignItems: 'center' },
});
