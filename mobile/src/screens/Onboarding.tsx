import React, { useCallback, useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import { AppText } from '../design/components/Text';
import { Button } from '../design/components/Button';
import { enter, springTo } from '../design/motion';
import { haptics } from '../design/haptics';
import { ArrowRightIcon } from '../design/icons';
import { fontScaleCap, palette } from '../design/tokens';
import { VicLogo } from '../components/brand/VicLogo';
import { HexMotifShape } from '../components/auth/LoginHero';
import { StoryScenes } from '../components/onboarding/StoryScenes';
import { markOnboardingSeen } from '../common/utils/onboarding';

export const STORY_DURATION = 3800;

const STORIES = ['organizations', 'events', 'hours', 'documents'] as const;

// page indicator: the current page is a long pill that fills with yellow while the story runs
const DOT = 8;
const PILL = 32;

const PageDot = ({
  state,
  progress,
}: {
  state: 'done' | 'current' | 'next';
  progress: SharedValue<number>;
}) => {
  const reduced = useReducedMotion();
  const current = useSharedValue(state === 'current' ? 1 : 0);
  useEffect(() => {
    current.value = springTo(state === 'current' ? 1 : 0, 'snappy', reduced);
  }, [state, reduced, current]);
  const dotStyle = useAnimatedStyle(() => ({ width: DOT + (PILL - DOT) * current.value }));
  const fillStyle = useAnimatedStyle(() => ({
    width: `${(state === 'done' ? 1 : state === 'current' ? progress.value : 0) * 100}%`,
  }));
  return (
    <Animated.View style={[styles.dot, dotStyle]}>
      <Animated.View style={[styles.dotFill, fillStyle]} />
    </Animated.View>
  );
};

/**
 * First-run intro „Îndrăzneț”: navy, the masthead hexagon behind four stories of 3.8s that advance
 * on their own, a page indicator, a big Bricolage line per story and the yellow button.
 * Tap the left third to go back, the rest to go forward, hold to pause. "Sari peste" and
 * "Începe" go to the login screen.
 */
const Onboarding = ({ navigation }: any) => {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  // Android: light navigation buttons on the navy screen, dark again for the rest of the app
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }
      NavigationBar.setStyle('light');
      return () => NavigationBar.setStyle('dark');
    }, []),
  );
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const last = index === STORIES.length - 1;

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(STORIES.length - 1, next)));
  }, []);

  const run = useCallback(
    (from: number) => {
      progress.value = from;
      const remaining = STORY_DURATION * (1 - from);
      progress.value = withTiming(1, { duration: remaining, easing: Easing.linear }, (finished) => {
        if (finished) {
          runOnJS(goTo)(index + 1);
        }
      });
    },
    [goTo, index, progress],
  );

  // every story starts from an empty pill; the last one stops when full
  useEffect(() => {
    run(0);
    return () => cancelAnimation(progress);
  }, [index, run, progress]);

  const finish = async () => {
    cancelAnimation(progress);
    await markOnboardingSeen();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('landing');
    }
  };

  const onTap = (event: GestureResponderEvent) => {
    haptics.selection();
    goTo(event.nativeEvent.locationX < width / 3 ? index - 1 : index + 1);
  };
  const onHold = () => cancelAnimation(progress);
  const onRelease = () => {
    if (progress.value < 1) {
      run(progress.value);
    }
  };

  const Scene = StoryScenes[index];
  const story = STORIES[index];

  // The scene shrinks to the room left between the header and the text: on a small phone
  // (iPhone SE, Android 360×640) the text never covers it.
  const [stageHeight, setStageHeight] = useState(0);
  const [sceneHeight, setSceneHeight] = useState(0);
  const sceneScale = stageHeight && sceneHeight ? Math.min(1, (stageHeight - 16) / sceneHeight) : 1;
  const motifSize = Math.min(340, width * 0.9);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]} testID="onboarding">
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.brand}>
          <VicLogo size={28} dark={palette.white} />
          <Text maxFontSizeMultiplier={fontScaleCap.display} style={styles.brandText}>
            VIC
          </Text>
        </View>
        <Pressable
          onPress={finish}
          hitSlop={12}
          accessibilityRole="button"
          style={styles.skip}
          testID="onboarding-skip"
        >
          <AppText variant="label" color={palette.white}>
            {t('skip')}
          </AppText>
        </Pressable>
      </View>

      <Pressable
        style={styles.stage}
        onPress={onTap}
        onLongPress={onHold}
        delayLongPress={180}
        onPressOut={onRelease}
        onLayout={(event) => setStageHeight(event.nativeEvent.layout.height)}
        accessibilityRole="button"
        accessibilityLabel={`${t('a11y.stage')}`}
        accessibilityHint={`${t('a11y.stage_hint')}`}
        testID="onboarding-stage"
      >
        {/* the masthead hexagon, quiet behind the scene */}
        <View
          pointerEvents="none"
          style={[styles.motif, { transform: [{ scale: sceneScale }] }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <HexMotifShape size={motifSize} color={palette.navy2} coreColor={palette.navy3} />
        </View>
        <View
          style={{ transform: [{ scale: sceneScale }] }}
          onLayout={(event) => setSceneHeight(event.nativeEvent.layout.height)}
        >
          <Scene key={story} />
        </View>
      </Pressable>

      <View style={styles.copy} accessibilityLiveRegion="polite">
        <Animated.View key={`eye-${index}`} entering={enter(0, reduced)}>
          <AppText variant="overline" color={palette.yellow}>
            {t(`stories.${story}.eyebrow`)}
          </AppText>
        </Animated.View>
        <Animated.View key={`title-${index}`} entering={enter(1, reduced)}>
          <AppText variant="largeTitle" color={palette.white} style={styles.title}>
            {t(`stories.${story}.title`)}
          </AppText>
        </Animated.View>
      </View>

      <View style={[styles.foot, { paddingBottom: 20 + insets.bottom }]}>
        <View
          style={styles.dots}
          accessibilityRole="progressbar"
          accessibilityLabel={`${t('a11y.progress', { current: index + 1, total: STORIES.length })}`}
          accessibilityValue={{ min: 1, max: STORIES.length, now: index + 1 }}
        >
          {STORIES.map((key, i) => (
            <PageDot
              key={key}
              progress={progress}
              state={i < index ? 'done' : i === index ? 'current' : 'next'}
            />
          ))}
        </View>
        {last ? (
          <Button full label={t('start')} onPress={finish} testID="onboarding-start" />
        ) : (
          <Button
            full
            label={t('next')}
            icon={<ArrowRightIcon size={20} color={palette.navy} strokeWidth={2.4} />}
            onPress={() => goTo(index + 1)}
            testID="onboarding-next"
          />
        )}
        <AppText variant="caption" color="rgba(255,255,255,0.6)" style={styles.center}>
          {t('footer')}
        </AppText>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 20,
    zIndex: 3,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: {
    fontFamily: theme.fontFamily.display,
    fontSize: 20,
    letterSpacing: 1.2,
    color: theme.colors.white,
  },
  skip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  // stage, text and buttons stack in the normal flow: nothing overlaps whatever the screen height
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  motif: { position: 'absolute' },
  copy: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, gap: 10, minHeight: 112 },
  title: { fontSize: 34, lineHeight: 36 },
  foot: { paddingHorizontal: 24, gap: 14 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  dotFill: { height: '100%', borderRadius: DOT / 2, backgroundColor: theme.colors.yellow },
  center: { textAlign: 'center' },
}));
