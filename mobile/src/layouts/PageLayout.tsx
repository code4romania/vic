import React, { ReactNode, useState } from 'react';
import { Icon, Spinner } from '@ui-kitten/components';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import { colors, fonts, shadows, spacing } from '../common/theme/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { EventIcon } from '../components/events/EventIcons';
import { PressableScale, VButton, VText } from '../components/ui';

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

// legacy ui-kitten icon, still used by News
export const BackIcon = (props: any) => <Icon {...props} name="arrow-left" />;

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
 * VIC 2.0 page: a round back button, the title, an optional edit link, the content, and the actions
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
          <PressableScale
            onPress={onBackButtonPress}
            style={[styles.back, shadows.back]}
            accessibilityLabel={`${t('back')}`}
            testID="page-back"
          >
            <EventIcon name="back" size={20} />
          </PressableScale>
        )}
        <VText variant="h2" numberOfLines={1} style={styles.title} accessibilityRole="header">
          {title}
        </VText>
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
  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.gutter,
    paddingVertical: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  edit: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
  childrenContainer: { flex: 1, paddingHorizontal: spacing.l, paddingVertical: spacing.s },
  actions: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: spacing.gutter,
    backgroundColor: colors.white,
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
