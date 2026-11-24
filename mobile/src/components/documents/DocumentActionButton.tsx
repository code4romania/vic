import React from 'react';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { LucideIcon, ICON_STROKE } from '../../design/icons';
import { palette } from '../../design/tokens';
import { PressableScale } from '../ui/PressableScale';

export interface DocumentActionButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  busy?: boolean;
  /** `paper` on a white card or header, `navy` on the orange card */
  tone?: 'paper' | 'navy' | 'white';
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** #727: the 44pt round Download / Share button of a document card and of the viewer header. */
export const DocumentActionButton = ({
  icon: Icon,
  onPress,
  accessibilityLabel,
  busy,
  tone = 'paper',
  testID,
  style,
}: DocumentActionButtonProps) => {
  const color = tone === 'navy' ? palette.yellow : palette.navy;
  return (
    <PressableScale
      onPress={onPress}
      disabled={busy}
      pressedScale={0.94}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: !!busy, disabled: !!busy }}
      testID={testID}
      style={[styles.button, styles[tone], style]}
    >
      {busy ? (
        <ActivityIndicator color={color} testID={testID ? `${testID}-busy` : undefined} />
      ) : (
        <Icon size={20} color={color} strokeWidth={ICON_STROKE + 0.5} />
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create((theme) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paper: { backgroundColor: theme.colors.paper },
  white: { backgroundColor: theme.colors.card },
  navy: { backgroundColor: theme.colors.navy },
}));
