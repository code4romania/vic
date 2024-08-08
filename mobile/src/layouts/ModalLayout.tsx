import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction, Text } from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { usePaddingTop } from '../hooks/usePaddingTop';

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

const CloseIcon = (props: any) => <Icon {...props} name="x" />;
const EditIcon = (props: any) => <Icon {...props} name="edit" />;
const renderTitle = (title: string) => () => (
  <Text allowFontScaling={ALLOW_FONT_SCALLING} category="h3" style={styles.title}>
    {title}
  </Text>
);

export const ModalLayout = ({
  children,
  title,
  onDismiss,
  onEditButtonPress,
  actionsOptions,
}: ModalLayoutProps) => {
  const paddingTop = usePaddingTop();
  const renderLeftControl = () => {
    return <TopNavigationAction icon={CloseIcon} onPress={onDismiss} />;
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
        // because on android we don't display this as a modal, it needs a top padding to include the insets
        style={[styles.header, Platform.OS === 'android' && { paddingTop }]}
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
            <Button
              label={actionsOptions.actionLabel}
              onPress={actionsOptions.onActionButtonClick}
              status={actionsOptions.buttonType || 'primary'}
              loading={actionsOptions.loading}
              disabled={actionsOptions.loading}
            />
          </View>
        )}
      </Layout>
    </>
  );
};

export default ModalLayout;

const styles = StyleSheet.create({
  header: { minHeight: 59 },
  layout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
  keyboardAvoidingContainer: { flex: 1 },
  childrenContainer: { flex: 1, padding: 16 },
  bottomActionContainer: {
    width: '100%',
    ...Platform.select({
      android: {
        minHeight: 100,
      },
      ios: {
        minHeight: 125,
      },
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingHorizontal: 8,
  },
});
