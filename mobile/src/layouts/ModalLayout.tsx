import React, { ReactNode, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { colors, fonts, spacing } from '../common/theme/tokens';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { EventIcon } from '../components/events/EventIcons';
import { PressableScale, VButton, VText } from '../components/ui';
import { ToastHost } from '../common/config/toast';

interface ActionsOptionsProps {
  actionLabel: string;
  onActionButtonClick: (props: any) => void;
  buttonType?: ButtonType;
  loading?: boolean;
}

interface ModalLayoutProps {
  children: ReactNode;
  title: string;
  onDismiss: () => void;
  onEditButtonPress?: () => void;
  actionsOptions?: ActionsOptionsProps;
}

const BUTTON_VARIANT = {
  [ButtonType.PRIMARY]: 'primary',
  [ButtonType.SECONDARY]: 'outline',
  [ButtonType.DANGER]: 'danger',
} as const;

/**
 * VIC 2.0 modal page: a round close button, the title, the content and one action that stays
 * above the keyboard.
 */
export const ModalLayout = ({
  children,
  title,
  onDismiss,
  onEditButtonPress,
  actionsOptions,
}: ModalLayoutProps) => {
  const { t } = useTranslation('general');
  const paddingTop = usePaddingTop();
  const [actionsHeight, setActionsHeight] = useState(0);
  // on android (edge-to-edge) the button needs to stay above the navigation bar
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

  return (
    // These screens are native modals on iOS: the app-level sheet provider renders behind them,
    // so selects and sheets inside a modal need a provider of their own to show on top.
    <BottomSheetModalProvider>
      <View style={styles.screen}>
        {/* on android this is not shown as a modal, so the header includes the insets */}
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop }]}>
          <PressableScale
            onPress={onDismiss}
            style={styles.close}
            accessibilityLabel={`${t('close')}`}
            testID="modal-close"
          >
            <EventIcon name="close" size={18} color={colors.ink} />
          </PressableScale>
          <VText variant="h2" numberOfLines={1} style={styles.title} accessibilityRole="header">
            {title}
          </VText>
          {onEditButtonPress && (
            <VText
              variant="label"
              style={styles.edit}
              onPress={onEditButtonPress}
              accessibilityRole="button"
              testID="modal-edit"
            >
              {t('edit', { item: '' }).trim()}
            </VText>
          )}
        </View>
        <View style={styles.childrenContainer}>
          <FormLayoutBottomOffsetContext.Provider value={actionsHeight}>
            {children}
          </FormLayoutBottomOffsetContext.Provider>
        </View>
        {actionsOptions && (
          // moves the button above the keyboard; the navigation bar inset is already
          // covered by the keyboard, so it is left behind it
          <KeyboardStickyView offset={{ opened: bottomInset }}>
            <View
              style={[
                styles.bottomActionContainer,
                { paddingBottom: Math.max(bottomInset, Platform.OS === 'ios' ? 34 : 16) },
              ]}
              onLayout={(event) => setActionsHeight(event.nativeEvent.layout.height)}
            >
              <VButton
                label={actionsOptions.actionLabel}
                onPress={() => actionsOptions.onActionButtonClick(undefined)}
                variant={BUTTON_VARIANT[actionsOptions.buttonType || ButtonType.PRIMARY]}
                loading={actionsOptions.loading}
                disabled={actionsOptions.loading}
                testID="modal-action"
              />
            </View>
          </KeyboardStickyView>
        )}
        {/* a failed save must be visible: on iOS this modal covers the app-level toasts */}
        <ToastHost />
      </View>
    </BottomSheetModalProvider>
  );
};

export default ModalLayout;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 12,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  edit: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  childrenContainer: { flex: 1, paddingHorizontal: spacing.l },
  bottomActionContainer: {
    width: '100%',
    backgroundColor: colors.white,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
