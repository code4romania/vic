import React, { ReactNode } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction, Spinner } from '@ui-kitten/components';
import Button from '../components/Button';
import { View, KeyboardAvoidingView, StyleSheet, Platform } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';

interface ActionsOptionsProps {
  primaryActionLabel: string;
  onPrimaryActionButtonClick: (props: any) => void;
  secondaryActionLabel?: string;
  onSecondaryActionButtonClick?: () => void;
  loading?: boolean;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  onBackButtonPress?: () => void;
  actionsOptions?: ActionsOptionsProps;
}

const BackIcon = (props: any) => <Icon {...props} name="arrow-left" />;

const LoadingIndicator = (props: any): React.ReactElement => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size="medium" />
  </View>
);

export const PageLayout = ({
  children,
  title,
  onBackButtonPress,
  actionsOptions,
}: PageLayoutProps) => {
  const renderLeftControl = () => {
    if (!onBackButtonPress) {
      return <></>;
    }

    return <TopNavigationAction icon={BackIcon} onPress={onBackButtonPress} />;
  };

  return (
    <>
      <TopNavigation title={title} alignment="start" accessoryLeft={renderLeftControl} />
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
              <Button
                onPress={actionsOptions.onPrimaryActionButtonClick}
                label={`${actionsOptions.primaryActionLabel}`}
                type={ButtonType.PRIMARY}
              />
            )}
          </View>
        )}
      </Layout>
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
});
