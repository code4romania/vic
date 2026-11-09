import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, shadows, spacing } from '../common/theme/tokens';
import { EventIcon } from '../components/events/EventIcons';
import { Enter, PressableScale, StateIcon, StateKind, VButton, VText } from '../components/ui';

interface MissingEntityProps {
  heading: string;
  paragraph: string;
  actionBtnLabel: string;
  onActionBtnPress: () => void;
  /** which picture goes on top (canvas board "Stări") */
  kind?: StateKind;
  onBackButtonPress?: () => void;
}

/** VIC 2.0 full-screen state: something missing, no organization, maintenance, an update needed. */
const MissingEntity = ({
  onActionBtnPress,
  heading,
  paragraph,
  actionBtnLabel,
  kind = 'missing',
  onBackButtonPress,
}: MissingEntityProps) => {
  const { t } = useTranslation('general');
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
    >
      {onBackButtonPress ? (
        <PressableScale
          onPress={onBackButtonPress}
          style={[styles.back, shadows.back]}
          accessibilityLabel={`${t('back')}`}
          testID="state-back"
        >
          <EventIcon name="back" size={20} />
        </PressableScale>
      ) : (
        <View style={styles.backSpace} />
      )}
      <Enter style={styles.body}>
        <StateIcon kind={kind} />
        <VText variant="h2" style={styles.center} accessibilityRole="header">
          {heading}
        </VText>
        {!!paragraph && (
          <VText variant="sub" style={styles.center}>
            {paragraph}
          </VText>
        )}
      </Enter>
      <VButton label={actionBtnLabel} onPress={onActionBtnPress} testID="state-action" />
    </View>
  );
};

export default MissingEntity;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.gutter },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpace: { height: 40 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
  center: { textAlign: 'center' },
});
