import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Avatar } from './ui/Avatar';
import { HexAvatar } from '../design/components/ListRow';
import { AppText } from '../design/components/Text';

interface OrganizationIdentityProps {
  name: string;
  uri?: string | null;
  /** on a white card of its own (join / leave screens on paper); false inside another card */
  card?: boolean;
}

/**
 * Organization logo (the navy hexagon with its initials when it has none) and name, at the top of
 * the join / leave / volunteer profile screens.
 */
const OrganizationIdentity = ({ name, uri, card = false }: OrganizationIdentityProps) => (
  <View style={[styles.container, card && styles.card]}>
    {uri ? <Avatar name={name} uri={uri} size={44} shape="rounded" /> : <HexAvatar name={name} />}
    <AppText variant="headline" style={styles.name} numberOfLines={2}>
      {name}
    </AppText>
  </View>
);

export default OrganizationIdentity;

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.space.m, flexDirection: 'row', alignItems: 'center' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    paddingVertical: theme.space.m,
    paddingHorizontal: theme.space.l,
  },
  name: { flex: 1 },
}));
