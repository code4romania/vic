import React, { ReactNode, useState } from 'react';
import { Platform, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { LayoutHeader, RoundIconButton } from './LayoutHeader';
import { BUTTON_VARIANT } from './PageLayout';
import { Button } from '../design/components/Button';
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

/**
 * „Îndrăzneț” modal page: paper, a 44pt round white close button, the title in Bricolage, the
 * content and one action that stays above the keyboard.
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
        <LayoutHeader
          title={title}
          style={[styles.header, Platform.OS === 'android' ? { paddingTop } : null]}
          leading={
            <RoundIconButton
              icon="close"
              onPress={onDismiss}
              accessibilityLabel={`${t('close')}`}
              testID="modal-close"
            />
          }
          onEditButtonPress={onEditButtonPress}
          editLabel={t('edit', { item: '' }).trim()}
          editTestID="modal-edit"
        />
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
              <Button
                full
                label={actionsOptions.actionLabel}
                onPress={() => actionsOptions.onActionButtonClick(undefined)}
                variant={BUTTON_VARIANT[actionsOptions.buttonType || ButtonType.PRIMARY]}
                loading={actionsOptions.loading}
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

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: theme.space.m },
  childrenContainer: { flex: 1, paddingHorizontal: theme.space.gutter },
  bottomActionContainer: {
    width: '100%',
    backgroundColor: theme.colors.background,
    paddingTop: theme.space.m,
    paddingHorizontal: theme.space.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
  },
}));
