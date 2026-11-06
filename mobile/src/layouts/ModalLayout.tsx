import React, { ReactNode, useState } from 'react';
import { Layout, TopNavigation, Icon, TopNavigationAction, Text } from '@ui-kitten/components';
import { ButtonType } from '../common/enums/button-type.enum';
import { Platform, StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Button from '../components/Button';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { FormLayoutBottomOffsetContext } from './FormLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [actionsHeight, setActionsHeight] = useState(0);
  // on android (edge-to-edge) the button needs to stay above the navigation bar
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;

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
        <View style={styles.childrenContainer}>
          <FormLayoutBottomOffsetContext.Provider value={actionsHeight}>
            {children}
          </FormLayoutBottomOffsetContext.Provider>
        </View>
        {actionsOptions && (
          // moves the button above the keyboard; the navigation bar inset is already
          // covered by the keyboard, so it is left behind it
          <KeyboardStickyView offset={{ opened: bottomInset }}>
            <View
              style={[styles.bottomActionContainer, { paddingBottom: bottomInset }]}
              onLayout={(event) => setActionsHeight(event.nativeEvent.layout.height)}
            >
              <Button
                label={actionsOptions.actionLabel}
                onPress={actionsOptions.onActionButtonClick}
                status={actionsOptions.buttonType || 'primary'}
                loading={actionsOptions.loading}
                disabled={actionsOptions.loading}
              />
            </View>
          </KeyboardStickyView>
        )}
      </Layout>
    </>
  );
};

export default ModalLayout;

const styles = StyleSheet.create({
  header: { minHeight: 59 },
  layout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
  childrenContainer: { flex: 1, padding: 16 },
  bottomActionContainer: {
    width: '100%',
    backgroundColor: 'white',
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
