import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction, Button } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';

interface ActionsOptionsProps {
  primaryActionLabel: string;
  onPrimaryActionButtonClick: (props: any) => void;
  secondaryActionLabel?: string;
  onSecondaryActionButtonClick?: () => void;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
  actionsOptions?: ActionsOptionsProps;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-back" />;

export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
  actionsOptions,
}: PageLayoutProps) => (
  <>
    <TopNavigation
      title={title}
      alignment="start"
      accessoryLeft={
        onBackButtonPress && <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />
      }
    />
    <Layout style={styles.layout}>
      <View style={styles.childrenContainer}>{children}</View>
      {actionsOptions && (
        <View style={styles.bottomActionContainer}>
          <Button
            onPress={actionsOptions.onPrimaryActionButtonClick}
          >{`${actionsOptions.primaryActionLabel}`}</Button>
        </View>
      )}
    </Layout>
  </>
);

export default PageLayout;

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
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
});
