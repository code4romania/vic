import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ICON_STROKE, LucideIcon } from '../design/icons';
import { palette } from '../design/tokens';

interface IGrayIconProps {
  /** a lucide icon from src/design/icons */
  icon: LucideIcon;
  backgroundColor?: string;
  color?: string;
}

/** A lucide icon in a 48pt round paper tile. */
const GrayIcon = ({ icon: Icon, backgroundColor, color = palette.navy }: IGrayIconProps) => (
  <View style={[styles.container, backgroundColor ? { backgroundColor } : null]}>
    <Icon size={24} color={color} strokeWidth={ICON_STROKE} />
  </View>
);

export default GrayIcon;

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
}));
