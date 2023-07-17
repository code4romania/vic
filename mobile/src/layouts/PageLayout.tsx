import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
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
import { View, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetProps } from '../components/BottomSheet';
import { useBottomSheet } from '../store/bottom-sheet/bottom-sheet.selector';
import InlineLink from '../components/InlineLink';

interface ActionsOptionsProps {
  primaryActionLabel: string;
  onPrimaryActionButtonClick: (props: any) => void;
  secondaryActionLabel?: string;
  secondaryActionLink?: string;
  onSecondaryActionButtonClick?: () => void;
  primaryBtnType?: ButtonType;
  loading?: boolean;
  helperText?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
  onEditButtonPress?: () => void;
  actionsOptions?: ActionsOptionsProps;
  bottomSheetOptions?: Omit<BottomSheetProps, 'modalRef'>;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-left" />;
const EditIcon = (props: any) => <Icon {...props} name="edit" />;
const renderTitle = (title: string) => () =>
  (
    <Text category="h3" style={styles.title}>
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
  bottomSheetOptions,
}: PageLayoutProps) => {
  const theme = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const { isOpen } = useBottomSheet();

  const onBottomSheetOpen = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    if (isOpen) {
      onBottomSheetOpen();
    }
  }, [isOpen, onBottomSheetOpen]);

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
        style={styles.header}
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
          <View style={styles.bottomActionContainer}>
            {
              <View style={styles.helperContainer}>
                {actionsOptions.helperText && (
                  <Text category="p1">{actionsOptions.helperText}</Text>
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
                        <Text category="p1">{actionsOptions.secondaryActionLabel || ''}</Text>
                        <InlineLink
                          style={
                            !actionsOptions.secondaryActionLabel
                              ? { color: theme['cool-gray-700'] }
                              : {}
                          }
                          onPress={actionsOptions.onSecondaryActionButtonClick}
                          label={actionsOptions.secondaryActionLink}
                        />
                      </View>
                    )}
                </View>
              </View>
            }
          </View>
        )}
      </Layout>
      {bottomSheetOptions && isOpen && (
        <BottomSheet
          iconType={bottomSheetOptions.iconType}
          modalRef={bottomSheetModalRef}
          heading={bottomSheetOptions.heading}
          paragraph={bottomSheetOptions.paragraph}
          primaryAction={bottomSheetOptions.primaryAction}
          secondaryAction={bottomSheetOptions.secondaryAction}
        />
      )}
    </>
  );
};

export default PageLayout;

const styles = StyleSheet.create({
  header: { minHeight: 59 },
  layout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
  keyboardAvoidingContainer: { flex: 1 },
  childrenContainer: { flex: 1, padding: 16 },
  bottomActionContainer: {
    backgroundColor: 'white',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2, // android only
    width: '100%',
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    paddingHorizontal: 8,
  },
  helperContainer: {
    gap: 12,
    alignItems: 'center',
  },
  buttonsContainer: {
    gap: 24,
    alignItems: 'center',
  },
  secondaryButtonContainer: { flexDirection: 'row', gap: 2 },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
