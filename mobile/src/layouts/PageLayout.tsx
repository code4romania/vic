import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;

export const PageLayout = ({ children, title, onBackButtonPress }: PageLayoutProps) => (
  <>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={
        onBackButtonPress && <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />
      }
    />
    <Layout style={styles.layout}>{children}</Layout>
  </>
);

export default PageLayout;

const styles = StyleSheet.create({
  layout: { flex: 1, alignItems: 'center' },
});
