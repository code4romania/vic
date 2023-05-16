import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface ModalLayoutProps {
  children: ReactNode;
  title: string;
  onDismiss: () => void;
}

const CloseIcon = (props: any) => <Icon {...props} name="x" />;

export const ModalLayout = ({ children, title, onDismiss }: ModalLayoutProps) => (
  <>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={<TopNavigationAction icon={CloseIcon} onPress={onDismiss} />}
    />
    <Layout style={styles.layout}>{children}</Layout>
  </>
);

export default ModalLayout;

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
