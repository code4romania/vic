import React, { ReactNode, useState } from 'react';
import { Spinner } from '@ui-kitten/components';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { colors, fonts, spacing } from '../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { VButton, VText } from '../components/ui';
import { BackButton } from '../components/ui/ScreenChrome';
import { AppText } from '../design/components/Text';

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

export const LoadingIndicator = (props: any): React.ReactElement => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="medium" />
  </View>
);

const BUTTON_VARIANT = {
  [ButtonType.PRIMARY]: 'primary',
  [ButtonType.SECONDARY]: 'outline',
  [ButtonType.DANGER]: 'danger',
} as const;

/**
 * „Îndrăzneț” pushed page on paper: the 44pt round white back button, the title, an optional edit link, the content, and the actions
 * that stay above the keyboard.
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
      <View style={[styles.header, headerStyle]}>
        {onBackButtonPress && (
          <BackButton
            onPress={onBackButtonPress}
            accessibilityLabel={`${t('back')}`}
            testID="page-back"
          />
        )}
        <AppText variant="title" numberOfLines={1} style={styles.title} accessibilityRole="header">
          {title}
        </AppText>
        {onEditButtonPress && (
          <VText
            variant="label"
            style={styles.edit}
            onPress={onEditButtonPress}
            accessibilityRole="button"
            testID="page-edit"
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
        // moves the buttons above the keyboard; the navigation bar inset is already
        // covered by the keyboard, so it is left behind it
        <KeyboardStickyView offset={{ opened: insets.bottom }}>
          <View
            style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}
            onLayout={(event) => setActionsHeight(event.nativeEvent.layout.height)}
          >
            {!!actionsOptions.helperText && (
              <VText variant="sub" style={styles.center}>
                {actionsOptions.helperText}
              </VText>
            )}
            <VButton
              onPress={() => actionsOptions.onPrimaryActionButtonClick(undefined)}
              label={`${actionsOptions.primaryActionLabel}`}
              variant={BUTTON_VARIANT[actionsOptions.primaryBtnType || ButtonType.PRIMARY]}
              loading={actionsOptions.loading}
              disabled={actionsOptions.loading}
              testID="page-action"
            />
            {actionsOptions.onSecondaryActionButtonClick && actionsOptions.secondaryActionLink && (
              <VText variant="sub" style={styles.center}>
                {actionsOptions.secondaryActionLabel
                  ? `${actionsOptions.secondaryActionLabel} `
                  : ''}
                <VText
                  variant="label"
                  style={styles.link}
                  onPress={actionsOptions.onSecondaryActionButtonClick}
                  accessibilityRole="button"
                  testID="page-secondary"
                >
                  {actionsOptions.secondaryActionLink}
                </VText>
              </VText>
            )}
          </View>
        </KeyboardStickyView>
      )}
    </View>
  );
};

export default PageLayout;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 12,
  },
  title: { flex: 1 },
  edit: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  childrenContainer: { flex: 1, paddingHorizontal: spacing.l, paddingVertical: spacing.s },
  actions: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  center: { textAlign: 'center' },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline', color: colors.ink },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
