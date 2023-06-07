import { useTheme } from '@ui-kitten/components';
import React from 'react';
import { Pressable } from 'react-native';

interface PressableContainerProps {
  children: React.ReactNode;
  onPress: () => void;
}

const PressableContainer = ({ children, onPress }: PressableContainerProps) => {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? theme['cool-gray-50'] : 'white',
        },
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

export default PressableContainer;
