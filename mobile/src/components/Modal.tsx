import React from 'react';
import {
  Card,
  Modal as KittenModal,
  ModalProps as KittenModalProps,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import Button from './Button';
import { View } from 'react-native';

interface ModalProps extends KittenModalProps {
  title: string;
  paragraph: string;
  primaryAction: {
    status: 'success' | 'danger';
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

const Modal = ({
  visible,
  onBackdropPress,
  title,
  paragraph,
  primaryAction,
  secondaryAction,
}: ModalProps) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <KittenModal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={onBackdropPress}
    >
      <Card style={styles.card}>
        <View style={styles.container}>
          <Text category="h1" style={styles.textCenter}>
            {title}
          </Text>
          <Text appearance="hint" style={styles.textCenter}>
            {paragraph}
          </Text>
          <Button
            label={primaryAction.label}
            onPress={primaryAction.onPress}
            status={primaryAction.status}
          />
          {secondaryAction && (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              appearance="ghost"
            />
          )}
        </View>
      </Card>
    </KittenModal>
  );
};

const themedStyles = StyleService.create({
  backdrop: {
    backgroundColor: '$backdrop',
  },
  textCenter: {
    textAlign: 'center',
  },
  container: {
    gap: 16,
  },
  card: {
    width: '99%',
  },
});

export default Modal;
