import React, { ReactNode, useState } from 'react';
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
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { ButtonType } from '../common/enums/button-type.enum';
import InlineLink from '../components/InlineLink';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { FormLayoutBottomOffsetContext } from './FormLayout';

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
  useFocusedStatusBarStyle('dark');
  const [actionsHeight, setActionsHeight] = useState(0);

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
              style={styles.helperContainer}
              onLayout={(event) => setActionsHeight(event.nativeEvent.layout.height)}
            >
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
                            !actionsOptions.secondaryActionLabel &&
                            !actionsOptions.secondaryLinkColor
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
          </KeyboardStickyView>
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
