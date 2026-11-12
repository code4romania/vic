import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../common/theme/tokens';
import { Enter, StateIcon, StateKind, VButton, VText } from '../components/ui';
import { BackButton } from '../components/ui/ScreenChrome';

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
        <BackButton
          onPress={onBackButtonPress}
          accessibilityLabel={`${t('back')}`}
          testID="state-back"
        />
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
  screen: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: spacing.gutter },
  backSpace: { height: 44 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
  center: { textAlign: 'center' },
});
