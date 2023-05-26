import React from 'react';
import { StyleSheet } from 'react-native';
import { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => <BaseToast {...props} style={styles.success} text1Style={styles.text} />,
  error: (props: any) => <BaseToast {...props} style={styles.error} text1Style={styles.text} />,
};

const styles = StyleSheet.create({
  success: {
    backgroundColor: '#12B6B6',
    borderLeftWidth: 0,
  },
  error: {
    backgroundColor: '#E23D3D',
    borderLeftWidth: 0,
  },
  text: {
    color: '#fff',
  },
});
