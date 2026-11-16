import React, { createContext, useCallback, useContext, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
  useKeyboardHandler,
  useReanimatedFocusedInput,
} from 'react-native-keyboard-controller';
import { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { FormRevealContext } from '../design/components/FormReveal';

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
  const scrollY = useRef(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  const reveal = useCallback(
    (node: View | null) => {
      const scrollView = scrollViewRef.current as unknown as View | null;
      if (!node || !scrollView?.measureInWindow) {
        return;
      }
      scrollView.measureInWindow((_x, viewTop, _w, viewHeight) => {
        node.measureInWindow((_nx, nodeTop, _nw, nodeHeight) => {
          const visibleBottom = viewTop + viewHeight - actionsHeight - INPUT_SPACING;
          // scroll the bottom into sight, but never past the top of the view
          const by = Math.min(
            nodeTop + nodeHeight - visibleBottom,
            nodeTop - viewTop - INPUT_SPACING,
          );
          if (by > 1) {
            scrollViewRef.current?.scrollTo({ y: scrollY.current + by, animated: true });
          }
        });
      });
    },
    [actionsHeight, scrollViewRef],
  );

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
      onScroll={onScroll}
    >
      <FormRevealContext.Provider value={reveal}>{children}</FormRevealContext.Provider>
    </KeyboardAwareScrollView>
  );
};

export default FormLayout;

const styles = StyleSheet.create({
  layout: { gap: 16, paddingBottom: 32 },
});
