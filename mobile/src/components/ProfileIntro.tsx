import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, VText } from './ui';
import { spacing } from '../common/theme/tokens';

interface ProfileIntroProps {
  /** profile picture; initials on navy when there is none */
  uri?: string | null;
  name: string;
  /** one line under the name (age, sex, city); hidden when empty */
  description?: string;
  /** extra content under the person, in the same card (e.g. the organization) */
  children?: React.ReactNode;
  testID?: string;
}

/** VIC 2.0 person card: round avatar, the full name and a meta line, on a white card. */
const ProfileIntro = ({ uri, name, description, children, testID }: ProfileIntroProps) => (
  <Card style={styles.card} testID={testID}>
    <View style={styles.person}>
      <Avatar name={name} uri={uri || null} size={64} shape="circle" />
      <View style={styles.text}>
        <VText variant="h2" accessibilityRole="header" numberOfLines={3}>
          {name}
        </VText>
        {!!description && <VText variant="sub">{description}</VText>}
      </View>
    </View>
    {children}
  </Card>
);

export default ProfileIntro;

const styles = StyleSheet.create({
  card: { padding: spacing.l, gap: spacing.l },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.l },
  text: { flex: 1, gap: 2 },
});
