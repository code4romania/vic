import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
  onEditButtonPress?: () => void;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;
const EditIcon = (props: any) => <Icon {...props} name="edit-outline" />;

export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
  onEditButtonPress,
}: PageLayoutProps) => (
  <>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={
        onBackButtonPress && <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />
      }
      accessoryRight={
        onEditButtonPress && <TopNavigationAction icon={EditIcon} onPress={onEditButtonPress} />
      }
    />
    <Layout style={styles.layout}>{children}</Layout>
  </>
);

export default PageLayout;

const styles = StyleSheet.create({
  layout: { flex: 1, padding: 16 },
});
