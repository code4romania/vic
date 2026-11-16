import React, { createContext, useCallback, useContext, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
  useKeyboardHandler,
  useReanimatedFocusedInput,
} from 'react-native-keyboard-controller';
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Height of the bottom actions rendered by the parent layout (PageLayout / ModalLayout).
// They stick to the keyboard, so the focused input is scrolled above them, not just above the keyboard.
export const FormLayoutBottomOffsetContext = createContext(0);

const INPUT_SPACING = 16;

interface FormLayoutProps {
  children: React.ReactNode;
  scrollRef?: React.RefObject<KeyboardAwareScrollViewRef | null>;
}

const FormLayout = ({ children, scrollRef }: FormLayoutProps) => {
  const actionsHeight = useContext(FormLayoutBottomOffsetContext);
  const internalScrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const scrollViewRef = scrollRef ?? internalScrollRef;
  const { input } = useReanimatedFocusedInput();

  const assureFocusedInputVisible = useCallback(() => {
    scrollViewRef.current?.assureFocusedInputVisible();
  }, [scrollViewRef]);

  // The automatic scroll of KeyboardAwareScrollView doesn't run on Android (RN 0.86), so we trigger it
  // once the keyboard is open and whenever the focus moves to another input while it stays open.
  useKeyboardHandler(
    {
      onEnd: (event) => {
        'worklet';
        if (event.height > 0) {
          scheduleOnRN(assureFocusedInputVisible);
        }
      },
    },
    [assureFocusedInputVisible],
  );

  useAnimatedReaction(
    () => input.value?.target,
    (target, previousTarget) => {
      if (target !== undefined && previousTarget !== undefined && target !== previousTarget) {
        scheduleOnRN(assureFocusedInputVisible);
      }
    },
    [assureFocusedInputVisible],
  );

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      bottomOffset={actionsHeight + INPUT_SPACING}
      // the default "insets" mode doesn't extend the scrollable area on Android (RN 0.86)
      mode="layout"
      bounces={false}
      bouncesZoom={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.layout}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export default FormLayout;

const styles = StyleSheet.create({
  layout: { gap: 16, paddingBottom: 32 },
});
