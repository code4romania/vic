import React, { ReactNode, useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { LayoutHeader, RoundIconButton } from './LayoutHeader';
import { Button, ButtonVariant } from '../design/components/Button';
import { AppText } from '../design/components/Text';
import { palette } from '../design/tokens';

interface ActionsOptionsProps {
  primaryActionLabel: string;
  onPrimaryActionButtonClick: (props: any) => void;
  secondaryActionLabel?: string;
  secondaryActionLink?: string;
  onSecondaryActionButtonClick?: () => void;
  primaryBtnType?: ButtonType;
  loading?: boolean;
  helperText?: string;
  secondaryLinkColor?: boolean;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
  onEditButtonPress?: () => void;
  actionsOptions?: ActionsOptionsProps;
  headerStyle?: ViewStyle;
}

export const BUTTON_VARIANT: Record<ButtonType, ButtonVariant> = {
  [ButtonType.PRIMARY]: 'primary',
  [ButtonType.SECONDARY]: 'outline',
  [ButtonType.DANGER]: 'destructive',
};

/**
 * „Îndrăzneț” page: paper, a 44pt round white back button, the title in Bricolage, an optional
 * "Editează" pill, the content, and the actions (one yellow button) that stay above the keyboard.
 */
export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
  onEditButtonPress,
  actionsOptions,
  headerStyle,
}: PageLayoutProps) => {
  const { t } = useTranslation('general');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const [actionsHeight, setActionsHeight] = useState(0);

  return (
    <View style={styles.screen}>
      <LayoutHeader
        title={title}
        style={headerStyle}
        leading={
          onBackButtonPress ? (
            <RoundIconButton
              icon="back"
              onPress={onBackButtonPress}
              accessibilityLabel={`${t('back')}`}
              testID="page-back"
            />
          ) : undefined
        }
        onEditButtonPress={onEditButtonPress}
        editLabel={t('edit', { item: '' }).trim()}
        editTestID="page-edit"
      />
      <View style={styles.childrenContainer}>
        <FormLayoutBottomOffsetContext.Provider value={actionsHeight}>
          {children}
        </FormLayoutBottomOffsetContext.Provider>
      </View>

      {actionsOptions && (
        // moves the buttons above the keyboard; the navigation bar inset is already
        // covered by the keyboard, so it is left behind it
        <KeyboardStickyView offset={{ opened: insets.bottom }}>
          <View
            style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}
            onLayout={(event) => setActionsHeight(event.nativeEvent.layout.height)}
          >
            {!!actionsOptions.helperText && (
              <AppText variant="caption" color={palette.ink2} style={styles.center}>
                {actionsOptions.helperText}
              </AppText>
            )}
            <Button
              full
              onPress={() => actionsOptions.onPrimaryActionButtonClick(undefined)}
              label={`${actionsOptions.primaryActionLabel}`}
              variant={BUTTON_VARIANT[actionsOptions.primaryBtnType || ButtonType.PRIMARY]}
              loading={actionsOptions.loading}
              testID="page-action"
            />
            {actionsOptions.onSecondaryActionButtonClick && actionsOptions.secondaryActionLink && (
              <View style={styles.secondary}>
                {!!actionsOptions.secondaryActionLabel && (
                  <AppText variant="caption" color={palette.ink2}>
                    {actionsOptions.secondaryActionLabel}
                  </AppText>
                )}
                <Pressable
                  onPress={actionsOptions.onSecondaryActionButtonClick}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={styles.linkHit}
                  testID="page-secondary"
                >
                  <AppText variant="label" style={styles.link}>
                    {actionsOptions.secondaryActionLink}
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  );
};

export default PageLayout;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  childrenContainer: { flex: 1, paddingHorizontal: 16, paddingVertical: theme.space.xs },
  actions: {
    gap: theme.space.s,
    paddingTop: theme.space.m,
    paddingHorizontal: theme.space.gutter,
    backgroundColor: theme.colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
  },
  center: { textAlign: 'center' },
  secondary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: 6,
  },
  linkHit: { minHeight: 36, justifyContent: 'center' },
  link: { textDecorationLine: 'underline' },
}));
