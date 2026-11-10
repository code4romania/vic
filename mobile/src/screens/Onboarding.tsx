import React, { useCallback, useEffect, useState } from 'react';
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { VText } from '../components/ui/VText';
import { VButton } from '../components/ui/VButton';
import { Enter } from '../components/ui/Enter';
import { VicLogo } from '../components/brand/VicLogo';
import { StoryScenes } from '../components/onboarding/StoryScenes';
import { colors, fonts } from '../common/theme/tokens';
import { markOnboardingSeen } from '../common/utils/onboarding';

export const STORY_DURATION = 3800;

const STORIES = [
  { key: 'organizations', color: colors.yellow },
  { key: 'events', color: colors.tealLight },
  { key: 'hours', color: colors.yellow },
  { key: 'documents', color: '#93C5FD' },
] as const;

const ProgressSegment = ({
  state,
  progress,
}: {
  state: 'done' | 'current' | 'next';
  progress: SharedValue<number>;
}) => {
  const fillStyle = useAnimatedStyle(() => ({
    width: `${(state === 'done' ? 1 : state === 'current' ? progress.value : 0) * 100}%`,
  }));
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.segmentFill, fillStyle]} />
    </View>
  );
};

/**
 * First-run intro (Pinpoint-style stories): four stories of 3.8s that advance on their own.
 * Tap the left third to go back, the rest to go forward, hold to pause. "Sari peste" and
 * "Începe" go to the login screen.
 */
const Onboarding = ({ navigation }: any) => {
  const { t } = useTranslation('onboarding');
  const insets = useSafeAreaInsets();
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

  // every story starts from an empty bar; the last one stops when full
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 14 }]} testID="onboarding">
      <StatusBar style="light" />
      <View style={styles.top}>
        <View
          style={styles.bars}
          accessibilityRole="progressbar"
          accessibilityLabel={`${t('a11y.progress', { current: index + 1, total: STORIES.length })}`}
        >
          {STORIES.map((s, i) => (
            <ProgressSegment
              key={s.key}
              progress={progress}
              state={i < index ? 'done' : i === index ? 'current' : 'next'}
            />
          ))}
        </View>
        <View style={styles.header}>
          <View style={styles.brand}>
            <VicLogo size={26} dark="#FFFFFF" />
            <VText style={styles.brandText}>VIC</VText>
          </View>
          <Pressable
            onPress={finish}
            hitSlop={12}
            accessibilityRole="button"
            testID="onboarding-skip"
          >
            <VText variant="bodyStrong" color="rgba(255,255,255,0.75)">
              {t('skip')}
            </VText>
          </Pressable>
        </View>
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
        <Svg
          width={300}
          height={300}
          style={[styles.glow, { transform: [{ scale: sceneScale }] }]}
          pointerEvents="none"
        >
          <Circle cx={150} cy={150} r={150} fill={story.color} opacity={0.12} />
          <Circle cx={150} cy={150} r={90} fill={story.color} opacity={0.12} />
        </Svg>
        <View
          style={{ transform: [{ scale: sceneScale }] }}
          onLayout={(event) => setSceneHeight(event.nativeEvent.layout.height)}
        >
          <Scene key={story.key} />
        </View>
      </Pressable>

      <View style={styles.copy} accessibilityLiveRegion="polite">
        <Enter key={`eye-${index}`}>
          <VText variant="label" color={story.color} style={styles.eyebrow}>
            {t(`stories.${story.key}.eyebrow`)}
          </VText>
        </Enter>
        <Enter key={`title-${index}`} index={1}>
          <VText style={styles.title}>{t(`stories.${story.key}.title`)}</VText>
        </Enter>
      </View>

      <View style={[styles.foot, { paddingBottom: 24 + insets.bottom }]}>
        {last ? (
          <VButton label={t('start')} onPress={finish} testID="onboarding-start" />
        ) : (
          <VButton label={t('next')} onPress={() => goTo(index + 1)} testID="onboarding-next" />
        )}
        <VText variant="cap" color="rgba(255,255,255,0.6)" style={styles.center}>
          {t('footer')}
        </VText>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  top: { paddingHorizontal: 20, gap: 10, zIndex: 3 },
  bars: { flexDirection: 'row', gap: 6 },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  segmentFill: { height: '100%', borderRadius: 2, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.title, fontSize: 20, letterSpacing: 1.2, color: colors.white },
  // stage, text and buttons stack in the normal flow: nothing overlaps whatever the screen height
  stage: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: { position: 'absolute' },
  copy: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20, gap: 8, minHeight: 100 },
  eyebrow: { fontFamily: fonts.bold, letterSpacing: 0.3 },
  title: { fontFamily: fonts.title, fontSize: 30, lineHeight: 36, color: colors.white },
  foot: { paddingHorizontal: 24, gap: 14 },
  center: { textAlign: 'center' },
});
