import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction } from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';
import { StyleSheet, View } from 'react-native';
import Button from '../components/Button';

interface ActionsOptionsProps {
  onActionLabel: string;
  onActionButtonClick: (props: any) => void;
  buttonType: ButtonType;
}

interface ModalLayoutProps {
  children: ReactNode;
  title: string;
  onDismiss: () => void;
  actionsOptions?: ActionsOptionsProps;
}

const CloseIcon = (props: any) => <Icon {...props} name="x" />;

export const ModalLayout = ({ children, title, onDismiss, actionsOptions }: ModalLayoutProps) => (
  <>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={<TopNavigationAction icon={CloseIcon} onPress={onDismiss} />}
    />
    <Layout style={styles.layout}>
      {children}
      {actionsOptions && (
        <View style={styles.buttonWrapper}>
          <Button
            label={actionsOptions.onActionLabel}
            onPress={actionsOptions.onActionButtonClick}
          />
        </View>
      )}
    </Layout>
  </>
);

export default ModalLayout;

const styles = StyleSheet.create({
  layout: { flex: 1, paddingHorizontal: 16, justifyContent: 'space-between', paddingBottom: 25 },
  buttonWrapper: { marginLeft: 'auto', marginRight: 'auto' },
});
