import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, VText } from './ui';
import { HexAvatar } from '../design/components';
import { colors, radius, spacing } from '../common/theme/tokens';

interface OrganizationIdentityProps {
  name: string;
  uri?: string | null;
  /** on a white card of its own (join / leave screens on paper); false inside another card */
  card?: boolean;
}

/**
 * Organization logo (the navy hexagon with its initials when it has none) and name, at the top of
 * the join / leave screens.
 */
const OrganizationIdentity = ({ name, uri, card = false }: OrganizationIdentityProps) => (
  <View style={[styles.container, card && styles.card]}>
    {uri ? <Avatar name={name} uri={uri} size={44} shape="rounded" /> : <HexAvatar name={name} />}
    <VText variant="h3" style={styles.name} numberOfLines={2}>
      {name}
    </VText>
  </View>
);

export default OrganizationIdentity;

const styles = StyleSheet.create({
  container: { gap: 12, flexDirection: 'row', alignItems: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: spacing.m,
    paddingHorizontal: 14,
  },
  name: { flex: 1 },
});
