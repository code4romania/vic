import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  Layout,
  TopNavigation,
  Icon,
  TopNavigationAction,
  Spinner,
  Text,
} from '@ui-kitten/components';
import Button from '../components/Button';
import { View, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheet, { BottomSheetProps } from '../components/BottomSheet';
import { useBottomSheet } from '../store/bottom-sheet/bottom-sheet.selector';

interface ActionsOptionsProps {
  primaryActionLabel: string;
  onPrimaryActionButtonClick: (props: any) => void;
  secondaryActionLabel?: string;
  onSecondaryActionButtonClick?: () => void;
  primaryBtnType?: ButtonType;
  loading?: boolean;
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

const LoadingIndicator = (props: any): React.ReactElement => (
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
            {actionsOptions.loading ? (
              <LoadingIndicator /> // TODO: handle the loading state properly
            ) : (
              <View style={styles.buttonsContainer}>
                <Button
                  onPress={actionsOptions.onPrimaryActionButtonClick}
                  label={`${actionsOptions.primaryActionLabel}`}
                  status={actionsOptions.primaryBtnType || 'primary'}
                />
                {actionsOptions.onSecondaryActionButtonClick &&
                  actionsOptions.secondaryActionLabel && (
                    <TouchableWithoutFeedback onPress={actionsOptions.onSecondaryActionButtonClick}>
                      <Text category="p2">{actionsOptions.secondaryActionLabel}</Text>
                    </TouchableWithoutFeedback>
                  )}
              </View>
            )}
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
  buttonsContainer: {
    gap: 24,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
