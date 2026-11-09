import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { VText } from '../ui/VText';
import { Badge } from '../ui/Badge';
import { colors, fonts, motion } from '../../common/theme/tokens';

const EASE = motion.enter.easing;

/** Canvas `flyIn`: up 40pt and from 92% scale, 620ms, delayed per card. */
const flyIn = (delay: number) => () => {
  'worklet';
  const config = { duration: 620, easing: EASE };
  return {
    initialValues: { opacity: 0, transform: [{ translateY: 40 }, { scale: 0.92 }] },
    animations: {
      opacity: withDelay(delay, withTiming(1, config)),
      transform: [
        { translateY: withDelay(delay, withTiming(0, config)) },
        { scale: withDelay(delay, withTiming(1, config)) },
      ],
    },
  };
};

const Fly = ({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: any;
  children: React.ReactNode;
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View style={[styles.mini, style]} entering={reducedMotion ? undefined : flyIn(delay)}>
      {children}
    </Animated.View>
  );
};

/** Shows `from` first, then swaps to `to` with a small pop (canvas swapA / swapB). */
const Swap = ({
  from,
  to,
  after,
  style,
}: {
  from: React.ReactNode;
  to: React.ReactNode;
  after: number;
  style?: any;
}) => {
  const reducedMotion = useReducedMotion();
  const p = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      p.value = withDelay(after, withTiming(1, { duration: 300 }));
    }
  }, [after, p, reducedMotion]);
  const fromStyle = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  const toStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: 0.6 + 0.4 * p.value }],
  }));
  return (
    <View style={style}>
      <Animated.View style={[StyleSheet.absoluteFill, fromStyle]}>{from}</Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, toStyle]}>{to}</Animated.View>
    </View>
  );
};

const Check = ({ delay }: { delay: number }) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      scale.value = withDelay(
        delay,
        withSequence(withTiming(1.2, { duration: 300 }), withSpring(1)),
      );
    }
  }, [delay, scale, reducedMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.check, style]}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path
          d="m5 12 5 5 9-10"
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
};

const OrgRow = ({
  initials,
  name,
  meta,
  bg,
  fg,
  trailing,
  delay,
  style,
}: {
  initials: string;
  name: string;
  meta: string;
  bg: string;
  fg: string;
  trailing: React.ReactNode;
  delay: number;
  style?: any;
}) => (
  <Fly delay={delay} style={[styles.row, style]}>
    <View style={[styles.av, { backgroundColor: bg }]}>
      <VText variant="h3" color={fg} style={styles.avText}>
        {initials}
      </VText>
    </View>
    <View style={styles.flex}>
      <VText variant="h3" style={styles.small}>
        {name}
      </VText>
      <VText variant="cap">{meta}</VText>
    </View>
    {trailing}
  </Fly>
);

// The sample data below only illustrates the stories; it is not real organizations or people.
const OrganizationsScene = () => {
  const { t } = useTranslation('onboarding');
  return (
    <View style={styles.sceneOrgs}>
      <OrgRow
        initials="AE"
        name="Asociația Exemplu"
        meta={t('sample.org1_meta')}
        bg={colors.navy}
        fg={colors.yellow}
        trailing={<Check delay={900} />}
        delay={0}
      />
      <OrgRow
        initials="VM"
        name="Verde Mare"
        meta={t('sample.org2_meta')}
        bg="#E0F5F3"
        fg="#0A7C7C"
        trailing={<Check delay={1150} />}
        delay={120}
        style={styles.offset}
      />
      <OrgRow
        initials="CS"
        name="Casa Speranței"
        meta={t('sample.org3_meta')}
        bg="#FFF6CC"
        fg={colors.navy}
        delay={260}
        trailing={
          <View style={styles.joinPill}>
            <VText variant="cap" color={colors.navy} style={styles.bold}>
              {t('sample.join')}
            </VText>
          </View>
        }
      />
    </View>
  );
};

const EventScene = () => {
  const { t } = useTranslation('onboarding');
  return (
    <Fly style={styles.eventCard}>
      <View style={styles.cover}>
        <View style={styles.coverBadge}>
          <VText variant="cap" color={colors.ink} style={styles.bold}>
            {t('sample.event_date')}
          </VText>
        </View>
      </View>
      <View style={styles.eventBody}>
        <VText variant="h3">{t('sample.event_title')}</VText>
        <VText variant="cap">{t('sample.event_meta')}</VText>
        <Swap
          after={900}
          style={styles.swapButton}
          from={
            <View style={[styles.fakeButton, { backgroundColor: colors.yellow }]}>
              <VText variant="button" color={colors.navy} style={styles.fakeLabel}>
                {t('sample.going')}
              </VText>
            </View>
          }
          to={
            <View style={[styles.fakeButton, { backgroundColor: colors.status.ok.bg }]}>
              <VText variant="button" color={colors.status.ok.fg} style={styles.fakeLabel}>
                {t('sample.joined')}
              </VText>
            </View>
          }
        />
      </View>
    </Fly>
  );
};

const Bar = ({ height, delay, accent }: { height: number; delay: number; accent?: boolean }) => {
  const reducedMotion = useReducedMotion();
  const p = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      p.value = withDelay(delay, withTiming(1, { duration: 700, easing: EASE }));
    }
  }, [delay, p, reducedMotion]);
  const style = useAnimatedStyle(() => ({ height: `${height * p.value}%` }));
  return (
    <View style={styles.barSlot}>
      <Animated.View
        style={[styles.bar, { backgroundColor: accent ? colors.yellow : colors.line }, style]}
      />
    </View>
  );
};

const HoursScene = () => {
  const { t } = useTranslation('onboarding');
  return (
    <View style={styles.sceneHours}>
      <Fly style={styles.hoursCard}>
        <View style={styles.hoursTotal}>
          <VText style={styles.bigNumber}>128</VText>
          <VText variant="sub">{t('sample.hours_year')}</VText>
        </View>
        <View style={styles.bars}>
          {[40, 65, 50, 85, 70].map((h, i) => (
            <Bar key={i} height={h} delay={150 + i * 70} />
          ))}
          <Bar height={100} delay={500} accent />
        </View>
      </Fly>
      <Fly delay={260} style={styles.row}>
        <View style={styles.flex}>
          <VText variant="h3" style={styles.small}>
            {t('sample.log_title')}
          </VText>
          <VText variant="cap">{t('sample.log_meta')}</VText>
        </View>
        <Swap
          after={1300}
          style={styles.swapBadge}
          from={<Badge label={t('sample.pending')} tone="wait" />}
          to={<Badge label={t('sample.approved')} tone="ok" />}
        />
      </Fly>
    </View>
  );
};

const Line = ({ width = '100%' }: { width?: any }) => <View style={[styles.line, { width }]} />;

const DocumentsScene = () => {
  const { t } = useTranslation('onboarding');
  const reducedMotion = useReducedMotion();
  const stamp = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      stamp.value = withDelay(700, withSpring(1, { damping: 10, stiffness: 160 }));
    }
  }, [stamp, reducedMotion]);
  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [{ rotate: '-14deg' }, { scale: 1.8 - 0.8 * stamp.value }],
  }));
  return (
    <View style={styles.sceneDocs}>
      <Fly style={[styles.paper, styles.paperBack]}>
        <View />
      </Fly>
      <Fly delay={120} style={[styles.paper, styles.paperFront]}>
        <VText style={styles.paperTitle}>{t('sample.cert_title')}</VText>
        <VText variant="cap">{t('sample.cert_meta')}</VText>
        <View style={styles.lines}>
          <Line />
          <Line />
          <Line width="70%" />
          <Line />
          <Line width="55%" />
        </View>
        <Animated.View style={[styles.stamp, stampStyle]}>
          <VText variant="cap" color={colors.status.ok.fg} style={styles.bold}>
            {t('sample.signed')}
          </VText>
        </Animated.View>
      </Fly>
    </View>
  );
};

export const StoryScenes = [OrganizationsScene, EventScene, HoursScene, DocumentsScene];

const styles = StyleSheet.create({
  mini: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  flex: { flex: 1 },
  small: { fontSize: 15 },
  bold: { fontFamily: fonts.bold },
  av: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avText: { fontSize: 14 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
  },
  sceneOrgs: { width: 300, gap: 12 },
  offset: { marginLeft: 24, marginRight: -12 },
  eventCard: { width: 280, overflow: 'hidden' },
  cover: {
    height: 150,
    backgroundColor: colors.teal,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  coverBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 22,
    justifyContent: 'center',
  },
  eventBody: { padding: 14, gap: 4 },
  swapButton: { height: 44, marginTop: 10 },
  fakeButton: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fakeLabel: { fontSize: 15 },
  sceneHours: { width: 290, gap: 12 },
  hoursCard: { padding: 16, gap: 10 },
  hoursTotal: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  bigNumber: { fontFamily: fonts.title, fontSize: 34, lineHeight: 38, color: colors.ink },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, borderRadius: 3 },
  swapBadge: { width: 104, height: 24, alignItems: 'flex-end' },
  sceneDocs: { width: 250, height: 300 },
  paper: { position: 'absolute', padding: 18, gap: 8 },
  paperBack: {
    left: 30,
    top: 0,
    width: 200,
    height: 260,
    opacity: 0.55,
    transform: [{ rotate: '4deg' }],
  },
  paperFront: { left: 10, top: 20, width: 220, height: 270 },
  paperTitle: { fontFamily: fonts.title, fontSize: 16, lineHeight: 20, color: colors.ink },
  lines: { gap: 8, marginTop: 10 },
  line: { height: 6, borderRadius: 3, backgroundColor: colors.line },
  stamp: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    borderWidth: 2,
    borderColor: colors.status.ok.fg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
