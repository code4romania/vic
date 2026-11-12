import React from 'react';
import { Pressable } from 'react-native';
import { palette } from '../design/tokens';

interface PressableContainerProps {
  children: React.ReactNode;
  onPress: () => void;
}

/** White surface that turns paper while pressed. */
const PressableContainer = ({ children, onPress }: PressableContainerProps) => (
  <Pressable
    style={({ pressed }) => ({ backgroundColor: pressed ? palette.paper : palette.card })}
    onPress={onPress}
  >
    {children}
  </Pressable>
);

export default PressableContainer;
