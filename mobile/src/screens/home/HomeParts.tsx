// Pieces of Acasă „Îndrăzneț” (handbook prototype, screen „Acasă”): the compact glass bar, the
// organization row, the navy impact card with the liquid hexagon, the yellow to-do cards, the
// „Urmează” carousel and the „Luna aceasta” bento.
import React from 'react';
import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import { StyleSheet } from 'react-native-unistyles';
import i18n from '../../common/config/i18n';
import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';
import { IEventListItem } from '../../common/interfaces/event-list-item.interface';
import { formatEventWhen, shortMonth } from '../../common/utils/event-format';
import { fontScaleCap, glass, lightColors, palette, space, StatusKind } from '../../design/tokens';
import {
  ArrowRightIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  GlobeIcon,
  ICON_STROKE,
  LockIcon,
  LucideIcon,
  PinIcon,
} from '../../design/icons';
import { AppText } from '../../design/components/Text';
import { PressableScale } from '../../components/ui/PressableScale';
import { StatusChip } from '../../design/components/Chip';
import { HexAvatar } from '../../design/components/ListRow';
import { ImpactHexagon, useCountUp } from '../../design/components/ImpactHexagon';
import { CountBadge } from '../../design/components/CountBadge';

// ---------------------------------------------------------------------------------------------
// Large title + compact glass bar. The large title scrolls with the content (as in the
// prototype), shrinks and fades; the compact bar „Acasă” fades in after 48pt.

const COLLAPSE_AT = 48;

export const CompactBar = ({ title, scrollY }: { title: string; scrollY: SharedValue<number> }) => {
  const insets = useSafeAreaInsets();
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_AT - 16, COLLAPSE_AT],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [COLLAPSE_AT - 16, COLLAPSE_AT + 8],
          [6, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.compact, { paddingTop: insets.top, height: insets.top + 44 }, barStyle]}
      testID="home-compact-bar"
    >
      {Platform.OS === 'ios' && (
        <BlurView intensity={glass.blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.compactTint]} />
      <Animated.View style={titleStyle}>
        <AppText variant="headline" style={styles.compactTitle} numberOfLines={1}>
          {title}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
};

export const LargeTitle = ({ title, scrollY }: { title: string; scrollY: SharedValue<number> }) => {
  const style = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [10, 80], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: 1 - p * 0.9,
      transform: [
        { scale: interpolate(scrollY.value, [-80, 0], [1.08, 1], Extrapolation.CLAMP) - p * 0.12 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.largeTitle, style]}>
      <AppText variant="largeTitle" accessibilityRole="header" style={styles.largeTitleText}>
        {title}
      </AppText>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------------------------
// Organization row + bell

export const OrgRow = ({
  name,
  onSwitch,
  onNews,
  unread = 0,
}: {
  name?: string;
  /** set when there is another organization to switch to */
  onSwitch?: () => void;
  onNews: () => void;
  /** news newer than the last visit to „Noutăți”: the red badge on the bell */
  unread?: number;
}) => {
  const { t } = useTranslation('home');
  const newsLabel =
    unread > 0
      ? unread === 1
        ? `${t('news_unread_one')}`
        : `${t('news_unread', { n: unread })}`
      : `${t('news')}`;
  return (
    <View style={styles.orgRow}>
      {name ? (
        <PressableScale
          onPress={onSwitch}
          disabled={!onSwitch}
          style={[styles.orgOuter, styles.org]}
          accessibilityRole={onSwitch ? 'button' : 'text'}
          accessibilityLabel={`${t('org.overline')}: ${name}`}
          accessibilityHint={onSwitch ? `${t('org.switch')}` : undefined}
          testID="home-org"
        >
          <HexAvatar name={name} />
          <View style={styles.orgText}>
            <AppText variant="overline" color={palette.ink2}>
              {t('org.overline')}
            </AppText>
            <View style={styles.orgNameRow}>
              <AppText variant="bodyStrong" style={styles.orgName}>
                {name}
              </AppText>
              {!!onSwitch && (
                <ChevronDownIcon size={16} color={palette.navy} strokeWidth={ICON_STROKE} />
              )}
            </View>
          </View>
        </PressableScale>
      ) : (
        <View style={styles.orgOuter} />
      )}
      <PressableScale
        onPress={onNews}
        style={styles.bell}
        accessibilityLabel={newsLabel}
        testID="home-news"
      >
        <BellIcon size={22} color={palette.navy} strokeWidth={ICON_STROKE} />
        <CountBadge count={unread} testID="home-news-badge" />
      </PressableScale>
    </View>
  );
};

// ---------------------------------------------------------------------------------------------
// Impact card

const StripesSquare = () => (
  <View style={styles.sq}>
    {[0, 1, 2, 3].map((i) => (
      <View key={i} style={[styles.sqStripe, { left: -6 + i * 6 }]} />
    ))}
  </View>
);

export const ImpactCard = ({
  approved,
  pending,
  rejected,
  replay,
  onPress,
}: {
  approved: number;
  pending: number;
  rejected: number;
  /** changes on each focus, so the number counts again with the refill */
  replay: number;
  onPress: () => void;
}) => {
  const { t } = useTranslation('home');
  const reduced = useReducedMotion();
  const shown = useCountUp(approved, reduced, replay);
  const approvedA11y =
    approved === 1
      ? t('impact.a11y_approved_singular')
      : t(romanianDe(approved) ? 'impact.a11y_approved_de' : 'impact.a11y_approved', {
          n: approved,
        });
  const label = [
    approvedA11y,
    pending > 0 ? t('impact.a11y_pending', { n: pending }) : null,
    rejected > 0
      ? t(rejected === 1 ? 'impact.a11y_rejected_singular' : 'impact.a11y_rejected', {
          n: rejected,
        })
      : null,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <PressableScale
      onPress={onPress}
      style={styles.impact}
      accessibilityLabel={`${label}. ${t('impact.a11y_open')}`}
      testID="home-impact"
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ImpactHexagon
          approved={approved}
          pending={pending}
          rejected={rejected}
          size={108}
          tone="onNavy"
          accessibilityLabel={label}
        />
      </View>
      <View style={styles.impactBody}>
        <AppText variant="overline" color={palette.yellow}>
          {t('impact.overline')}
        </AppText>
        <AppText
          variant="display"
          color={palette.yellow}
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.num}
          testID="home-impact-count"
        >
          {`${shown}`}
          {/* the small „h” (36pt) inherits the line of the number; AppText trims the line */}
          <Text maxFontSizeMultiplier={fontScaleCap.display} style={styles.numUnit}>
            {'\u2009h'}
          </Text>
        </AppText>
        <AppText style={styles.impactLabel}>
          {approved === 1 ? t('impact.label_singular') : t('impact.label')}
        </AppText>
        {(pending > 0 || rejected > 0) && (
          <View style={styles.chips}>
            {pending > 0 && (
              <StatusChip
                kind="glass"
                icon={<StripesSquare />}
                label={`${t('impact.pending_chip', { n: pending })}`}
              />
            )}
            {rejected > 0 && (
              <StatusChip
                kind="glass"
                icon={<View style={[styles.sq, styles.sqRejected]} />}
                label={`${t(
                  rejected === 1 ? 'impact.rejected_chip_singular' : 'impact.rejected_chip',
                  { n: rejected },
                )}`}
              />
            )}
          </View>
        )}
      </View>
    </PressableScale>
  );
};

const romanianDe = (n: number) => {
  const rest = Math.abs(n) % 100;
  return n !== 0 && (rest === 0 || rest >= 20);
};

// ---------------------------------------------------------------------------------------------
// To-do card (yellow)

export const TodoCard = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  testID,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onPress: () => void;
  testID?: string;
}) => (
  <PressableScale
    onPress={onPress}
    style={styles.todo}
    accessibilityLabel={[title, subtitle].filter(Boolean).join(', ')}
    testID={testID}
  >
    <View style={styles.todoIcon}>
      <Icon size={22} color={palette.yellow} strokeWidth={ICON_STROKE} />
    </View>
    <View style={styles.todoText}>
      <AppText style={styles.todoTitle}>{title}</AppText>
      {!!subtitle && (
        <AppText variant="caption" color="rgba(1,52,79,0.75)">
          {subtitle}
        </AppText>
      )}
    </View>
    <View style={styles.go}>
      <ArrowRightIcon size={20} color={palette.yellow} strokeWidth={ICON_STROKE} />
    </View>
  </PressableScale>
);

// ---------------------------------------------------------------------------------------------
// Section head

export const SectionHead = ({
  title,
  action,
  onAction,
  testID,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  testID?: string;
}) => (
  <View style={styles.sect}>
    <AppText variant="title" accessibilityRole="header" style={styles.sectTitle}>
      {title}
    </AppText>
    {!!action && (
      // 44pt target around the short link
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}
        style={styles.link}
        testID={testID}
      >
        <AppText variant="label" style={styles.linkText}>
          {action}
        </AppText>
        <ChevronRightIcon size={16} color={palette.navy} strokeWidth={ICON_STROKE} />
      </Pressable>
    )}
  </View>
);

// ---------------------------------------------------------------------------------------------
// „Urmează” carousel

const CARD_WIDTH = 292;
const CARD_GAP = 10;

const dateLocale = () => (i18n.language === 'en' ? enUS : ro);
const dow = (value: string) =>
  format(new Date(value), 'EEE', { locale: dateLocale() }).replace('.', '').toUpperCase();
const dayMonth = (value: string) => ({
  day: format(new Date(value), 'd'),
  month: shortMonth(value).toUpperCase(),
});

const EventSlide = ({
  event,
  width,
  onPress,
}: {
  event: IEventListItem;
  width: number;
  onPress: (eventId: string) => void;
}) => {
  const { t } = useTranslation('events');
  const when = formatEventWhen(event.startDate, event.endDate);
  const { day, month } = dayMonth(event.startDate);
  const pending = event.registrationStatus === EventRegistrationStatus.PENDING;
  const rejected = event.registrationStatus === EventRegistrationStatus.REJECTED;
  const status: { kind: StatusKind; label: string } | null = pending
    ? { kind: 'wait', label: `${t('card.pending')}` }
    : rejected
      ? { kind: 'no', label: `${t('card.rejected')}` }
      : { kind: 'ok', label: `${t('card.going')}` };
  const audience = event.isPublic ? `${t('card.public')}` : `${t('card.members')}`;
  return (
    <PressableScale
      onPress={() => onPress(event.id)}
      // every card as tall as the tallest one (the prototype's flex row stretches them)
      style={[styles.ecard, { width }]}
      accessibilityLabel={[event.name, when, event.location, event.organizationName, status?.label]
        .filter(Boolean)
        .join(', ')}
      testID={`event-card-${event.id}`}
    >
      <View style={styles.dateb}>
        <AppText maxFontSizeMultiplier={1.15} style={styles.datebSmall}>
          {dow(event.startDate)}
        </AppText>
        <AppText maxFontSizeMultiplier={1.15} style={styles.datebDay}>
          {day}
        </AppText>
        <AppText maxFontSizeMultiplier={1.15} style={styles.datebSmall}>
          {month}
        </AppText>
      </View>
      <View style={styles.ebody}>
        <AppText variant="headline">{event.name}</AppText>
        <MetaLine icon={ClockIcon} text={when} first />
        {!!event.location && <MetaLine icon={PinIcon} text={event.location} />}
        {!!event.organizationName && <MetaLine text={event.organizationName} />}
        <View style={styles.etags}>
          <StatusChip
            kind={event.isPublic ? 'plain' : 'act'}
            label={capitalize(audience)}
            icon={
              event.isPublic ? (
                <GlobeIcon size={14} color={palette.navy} strokeWidth={ICON_STROKE} />
              ) : (
                <LockIcon size={14} color={palette.yellow} strokeWidth={ICON_STROKE} />
              )
            }
          />
          {status && <StatusChip kind={status.kind} label={status.label} />}
        </View>
      </View>
    </PressableScale>
  );
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const MetaLine = ({
  icon: Icon,
  text,
  first,
}: {
  icon?: LucideIcon;
  text: string;
  first?: boolean;
}) => (
  <View style={[styles.meta, first ? styles.metaFirst : null]}>
    {Icon && <Icon size={14} color={palette.ink2} strokeWidth={ICON_STROKE} />}
    <AppText variant="caption" color={palette.ink2} style={styles.metaText}>
      {text}
    </AppText>
  </View>
);

export const EventCarousel = ({
  events,
  onPress,
}: {
  events: IEventListItem[];
  onPress: (eventId: string) => void;
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // 292pt as in the prototype; narrower phones still show the edge of the next card
  const width = Math.min(CARD_WIDTH, screenWidth - space.gutter * 2 - 24);
  const single = events.length === 1;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={width + CARD_GAP}
      snapToAlignment="start"
      decelerationRate="fast"
      disableIntervalMomentum
      style={styles.carousel}
      contentContainerStyle={styles.carouselContent}
      testID="home-next"
    >
      {events.map((event) => (
        <EventSlide
          key={event.id}
          event={event}
          width={single ? screenWidth - space.gutter * 2 : width}
          onPress={onPress}
        />
      ))}
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------------------------
// „Luna aceasta” bento

export interface BentoTile {
  key: string;
  value?: number;
  label: string;
  onPress: () => void;
}

export const MonthBento = ({ tiles }: { tiles: BentoTile[] }) => {
  const { width: screenWidth } = useWindowDimensions();
  const tileWidth = (screenWidth - space.gutter * 2 - 8) / 2;
  return (
    <View style={styles.bento}>
      {tiles.map((tile, index) => {
        const ghost = tile.value === 0;
        const navy = index === 0 && !ghost;
        const content = (
          <>
            <AppText
              maxFontSizeMultiplier={1.15}
              style={[
                styles.tileN,
                { color: navy ? palette.yellow : ghost ? palette.ink2 : palette.navy },
              ]}
            >
              {`${tile.value ?? '–'}`}
            </AppText>
            <AppText
              style={[styles.tileL, { color: navy ? 'rgba(255,255,255,0.75)' : palette.ink2 }]}
            >
              {tile.label}
            </AppText>
          </>
        );
        const look = [
          styles.tile,
          { width: tileWidth },
          navy ? styles.tileNavy : ghost ? styles.tileGhost : null,
        ];
        return ghost ? (
          <View
            key={tile.key}
            style={look}
            accessible
            accessibilityLabel={`0 ${tile.label}`}
            testID={`home-stat-${tile.key}`}
          >
            {content}
          </View>
        ) : (
          <PressableScale
            key={tile.key}
            onPress={tile.onPress}
            style={look}
            accessibilityLabel={`${tile.value ?? 0} ${tile.label}`}
            testID={`home-stat-${tile.key}`}
          >
            {content}
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTint: {
    backgroundColor: Platform.OS === 'ios' ? lightColors.topBarTint : lightColors.androidTopBarTint,
  },
  compactTitle: {
    fontFamily: theme.fontFamily.display,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  largeTitle: { marginTop: 14, marginBottom: 16, transformOrigin: 'left bottom' },
  largeTitleText: { includeFontPadding: false },
  orgRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.m,
  },
  orgOuter: { flex: 1 },
  org: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: theme.hit.min },
  orgText: { flex: 1, minWidth: 0 },
  orgNameRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  orgName: { fontFamily: theme.fontFamily.textHeavy, flexShrink: 1 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impact: {
    backgroundColor: theme.colors.navy,
    borderRadius: theme.radius.hero,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.l,
    overflow: 'hidden',
  },
  impactBody: { flex: 1, minWidth: 0 },
  // prototype `.impact .num`: 76pt, line-height .86, right under the overline
  num: { includeFontPadding: false },
  numUnit: { fontSize: 36, letterSpacing: -1.08 },
  impactLabel: {
    fontFamily: theme.fontFamily.textBold,
    fontSize: 14.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sq: {
    width: 12,
    height: 12,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.yellow,
  },
  sqStripe: {
    position: 'absolute',
    top: -4,
    width: 3,
    height: 20,
    backgroundColor: theme.colors.yellow,
    transform: [{ rotate: '45deg' }],
  },
  sqRejected: { backgroundColor: '#E05A49', borderWidth: 0 },
  todo: {
    backgroundColor: theme.colors.yellow,
    borderRadius: theme.radius.card,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.m,
    marginTop: theme.space.s,
  },
  todoIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: theme.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: { flex: 1, minWidth: 0, gap: 1 },
  todoTitle: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 15.5,
    lineHeight: 20,
    color: theme.colors.navy,
  },
  go: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.space.section,
    marginBottom: theme.space.s,
    marginHorizontal: 2,
  },
  sectTitle: { flex: 1 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { fontSize: 14 },
  carousel: { marginHorizontal: -theme.space.gutter },
  carouselContent: {
    paddingHorizontal: theme.space.gutter,
    paddingBottom: 4,
    gap: CARD_GAP,
  },
  ecard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: theme.space.m,
  },
  dateb: {
    width: 60,
    borderRadius: theme.radius.control,
    backgroundColor: theme.colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  datebSmall: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.74,
    color: theme.colors.navy,
  },
  // prototype `.dateb b`: 30pt, line-height 1 (AppText trims the Bricolage line)
  datebDay: {
    fontFamily: theme.fontFamily.display,
    fontSize: 30,
    lineHeight: 30,
    includeFontPadding: false,
    letterSpacing: -1.2,
    color: theme.colors.navy,
    fontVariant: ['tabular-nums'],
  },
  ebody: { flex: 1, minWidth: 0, paddingVertical: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaFirst: { marginTop: 3 },
  metaText: { flexShrink: 1, fontFamily: theme.fontFamily.text },
  etags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    borderRadius: theme.radius.row,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 96,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
  },
  tileNavy: { backgroundColor: theme.colors.navy },
  tileGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(1,52,79,0.18)',
  },
  // prototype `.tile .n`: 40pt, line-height .9 (AppText trims the Bricolage line)
  tileN: {
    fontFamily: theme.fontFamily.display,
    fontSize: 40,
    lineHeight: 36,
    includeFontPadding: false,
    letterSpacing: -1.6,
    fontVariant: ['tabular-nums'],
  },
  tileL: {
    fontFamily: theme.fontFamily.textBold,
    fontSize: 12.5,
    lineHeight: 15.6,
    marginTop: 2,
  },
}));
