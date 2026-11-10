import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, VText } from './ui';

interface OrganizationIdentityProps {
  name: string;
  uri?: string | null;
}

/** Organization logo (initials when it has none) and name, at the top of the join / leave screens. */
const OrganizationIdentity = ({ name, uri }: OrganizationIdentityProps) => (
  <View style={styles.container}>
    <Avatar name={name} uri={uri || null} size={44} shape="rounded" />
    <VText variant="h3" style={styles.name} numberOfLines={2}>
      {name}
    </VText>
  </View>
);

export default OrganizationIdentity;

const styles = StyleSheet.create({
  container: { gap: 12, flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1 },
});
