import { Text } from '@ui-kitten/components';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface OrganizationIdentityProps {
  name: string;
  uri: string;
}

const OrganizationIdentity = ({ name, uri }: OrganizationIdentityProps) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} />
      <Text>{name}</Text>
    </View>
  );
};

export default OrganizationIdentity;

const styles = StyleSheet.create({
  image: { width: 32, height: 32, borderRadius: 32, borderWidth: 1, borderColor: '#E5E7EB' },
  container: { gap: 4, flexDirection: 'row', alignItems: 'center' },
});
