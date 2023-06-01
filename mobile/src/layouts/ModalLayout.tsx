import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction, Text } from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import { LoadingIndicator } from './PageLayout';

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
  actionsOptions?: ActionsOptionsProps;
}

const CloseIcon = (props: any) => <Icon {...props} name="x" />;
const renderTitle = (title: string) => () =>
  (
    <Text category="h3" style={styles.title}>
      {title}
    </Text>
  );

export const ModalLayout = ({ children, title, onDismiss, actionsOptions }: ModalLayoutProps) => {
  const renderLeftControl = () => {
    return <TopNavigationAction icon={CloseIcon} onPress={onDismiss} />;
  };
  return (
    <>
      <TopNavigation
        title={renderTitle(title)}
        alignment="start"
        accessoryLeft={renderLeftControl}
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
              <LoadingIndicator />
            ) : (
              <Button
                label={actionsOptions.actionLabel}
                onPress={actionsOptions.onActionButtonClick}
              />
            )}
          </View>
        )}
      </Layout>
    </>
  );
};

export default ModalLayout;

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
  title: {
    paddingHorizontal: 8,
  },
});
