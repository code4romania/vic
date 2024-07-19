import React, { ReactNode } from 'react';
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
  Spinner,
  Text,
  useTheme,
} from '@ui-kitten/components';
import Button from '../components/Button';
import { View, KeyboardAvoidingView, StyleSheet, Platform, ViewStyle } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import InlineLink from '../components/InlineLink';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export const BackIcon = (props: any) => <Icon {...props} name="arrow-left" />;
const EditIcon = (props: any) => <Icon {...props} name="edit" />;
const renderTitle = (title: string) => () => (
  <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={styles.title}>
    {title}
  </Text>
);

export const LoadingIndicator = (props: any): React.ReactElement => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="medium" />
  </View>
);

export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
  onEditButtonPress,
  actionsOptions,
  headerStyle,
}: PageLayoutProps) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const renderLeftControl = () => {
    if (!onBackButtonPress) {
      return <></>;
    }

    return <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />;
  };

  const renderRightControl = () => {
    if (!onEditButtonPress) {
      return <></>;
    }

    return <TopNavigationAction icon={EditIcon} onPress={onEditButtonPress} />;
  };

  return (
    <>
      <TopNavigation
        title={renderTitle(title)}
        alignment="start"
        accessoryLeft={renderLeftControl}
        accessoryRight={renderRightControl}
        style={[styles.header, headerStyle]}
      />
      <Layout style={styles.layout}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={-100} // This is the distance between the top of the user screen and the react native view - because we have put the avoiding view after the navigation
        >
          <View style={styles.childrenContainer}>{children}</View>
        </KeyboardAvoidingView>

        {actionsOptions && (
          <View style={styles.helperContainer}>
            <View style={[styles.bottomActionContainer, { paddingBottom: insets.bottom + 16 }]}>
              {actionsOptions.helperText && (
                <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
                  {actionsOptions.helperText}
                </Text>
              )}
              <View style={styles.buttonsContainer}>
                <Button
                  onPress={actionsOptions.onPrimaryActionButtonClick}
                  label={`${actionsOptions.primaryActionLabel}`}
                  status={actionsOptions.primaryBtnType || 'primary'}
                  loading={actionsOptions.loading}
                  disabled={actionsOptions.loading}
                />
                {actionsOptions.onSecondaryActionButtonClick &&
                  actionsOptions.secondaryActionLink && (
                    <View style={styles.secondaryButtonContainer}>
                      <Text allowFontScaling={ALLOW_FONT_SCALLING} category="p1">
                        {actionsOptions.secondaryActionLabel || ''}
                      </Text>
                      <InlineLink
                        style={[
                          !actionsOptions.secondaryActionLabel && !actionsOptions.secondaryLinkColor
                            ? { color: theme['color-primary-700'] }
                            : { color: theme['color-basic-1100'] },
                          styles.inlineLink,
                        ]}
                        onPress={actionsOptions.onSecondaryActionButtonClick}
                        label={actionsOptions.secondaryActionLink}
                      />
                    </View>
                  )}
              </View>
            </View>
          </View>
        )}
      </Layout>
    </>
  );
};

export default PageLayout;

const styles = StyleSheet.create({
  header: { minHeight: 59 },
  layout: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  keyboardAvoidingContainer: { flex: 1 },
  childrenContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottomActionContainer: {
    width: '100%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'gray',
    backgroundColor: 'white',
    gap: 16,
    paddingVertical: 16,
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  helperContainer: {
    gap: 12,
    alignItems: 'center',
  },
  title: {
    paddingHorizontal: 8,
  },
  buttonsContainer: {
    gap: 16,
    alignItems: 'center',
  },
  secondaryButtonContainer: { flexDirection: 'row', gap: 2 },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  inlineLink: {
    fontWeight: '500',
  },
});
