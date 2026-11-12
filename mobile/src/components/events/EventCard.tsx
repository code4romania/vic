import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';
import { IEventListItem } from '../../common/interfaces/event-list-item.interface';
import { dateTile, formatEventWhen, formatShortDay } from '../../common/utils/event-format';
import { AppText, StatusChip, StatusKind } from '../../design/components';
import { ClockIcon, GlobeIcon, LockIcon, PinIcon } from '../../design/icons';
import { palette } from '../../design/tokens';
import { springTo } from '../../design/motion';

export type EventCardItem = IEventListItem;

export interface EventCardProps {
  event: EventCardItem;
  onPress: (eventId: string) => void;
  /** Mark as joined even when the item has no isGoing (e.g. the "Particip" tab). */
  going?: boolean;
  /** Hairline under the row ("row" variant); off for the last row in a group. */
  divider?: boolean;
  /** "row" sits inside a white group, "card" is its own white card on the paper. */
  variant?: 'row' | 'card';
}

/** "SÂM" from "Sâm, 22 nov". */
const weekday = (value: string) => formatShortDay(value).split(',')[0].toLocaleUpperCase('ro-RO');

/** The date block: day of the week, a big Bricolage day and the month. */
export const DateBlock = ({
  date,
  tone,
  size = 'card',
}: {
  date: string;
  tone: 'yellow' | 'navy';
  size?: 'card' | 'hero';
}) => {
  const tile = dateTile(date);
  const ink = tone === 'yellow' ? palette.navy : palette.yellow;
  return (
    <View
      style={[
        styles.dateBlock,
        size === 'hero' ? styles.dateBlockHero : null,
        { backgroundColor: tone === 'yellow' ? palette.yellow : palette.navy },
      ]}
    >
      {/* fixed size: its text grows less than the rest */}
      <Text maxFontSizeMultiplier={1.15} style={[styles.dateSmall, { color: ink }]}>
        {weekday(date)}
      </Text>
      <Text
        maxFontSizeMultiplier={1.15}
        style={[styles.dateDay, size === 'hero' ? styles.dateDayHero : null, { color: ink }]}
      >
        {tile.day}
      </Text>
      <Text maxFontSizeMultiplier={1.15} style={[styles.dateSmall, { color: ink }]}>
        {tile.month}
      </Text>
    </View>
  );
};

/** The volunteer's status chip for an event: Încheiat / În așteptare / Respinsă / Înscris, or none. */
export const eventStatusChip = (
  event: Pick<EventCardItem, 'displayStatus' | 'registrationStatus' | 'isGoing'>,
  going?: boolean,
): { kind: StatusKind; key: string } | null => {
  if (event.displayStatus === 'finished') {
    return { kind: 'exp', key: 'card.finished' };
  }
  if (event.registrationStatus === EventRegistrationStatus.PENDING) {
    return { kind: 'wait', key: 'card.pending' };
  }
  if (event.registrationStatus === EventRegistrationStatus.REJECTED) {
    return { kind: 'no', key: 'card.rejected' };
  }
  if (going || event.isGoing) {
    return { kind: 'ok', key: 'card.going' };
  }
  return null;
};

/**
 * Event card „Îndrăzneț”: a date block (yellow once you are in, navy otherwise), the title, when,
 * where and who organizes it, then chips: Public / Doar membri and the volunteer's status
 * ("Înscris", "În așteptare" while the organization decides (#501), "Respinsă" (#593), "Încheiat").
 */
export const EventCard = ({
  event,
  onPress,
  going,
  divider = true,
  variant = 'row',
}: EventCardProps) => {
  const { t } = useTranslation('events');
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : interpolate(pressed.value, [0, 1], [1, 0.985]) }],
  }));

  const chip = eventStatusChip(event, going);
  const enrolled = chip?.kind === 'ok';
  const when = formatEventWhen(event.startDate, event.endDate);

  return (
    <Pressable
      onPress={() => onPress(event.id)}
      onPressIn={() => {
        pressed.value = springTo(1, 'snappy', reduced);
      }}
      onPressOut={() => {
        pressed.value = springTo(0, 'snappy', reduced);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${event.name}, ${when}`}
      testID={`event-card-${event.id}`}
    >
      <Animated.View
        style={[
          styles.card,
          variant === 'card' ? styles.standalone : styles.row,
          variant === 'row' && divider ? styles.divider : null,
          pressStyle,
        ]}
      >
        <DateBlock date={event.startDate} tone={enrolled ? 'yellow' : 'navy'} />
        <View style={styles.body}>
          <AppText variant="headline" numberOfLines={2}>
            {event.name}
          </AppText>
          <View style={styles.meta}>
            <ClockIcon size={14} color={palette.ink2} />
            <AppText
              variant="caption"
              color={palette.ink2}
              numberOfLines={2}
              style={styles.metaText}
            >
              {when}
            </AppText>
          </View>
          {!!event.location && (
            <View style={styles.meta}>
              <PinIcon size={14} color={palette.ink2} />
              <AppText
                variant="caption"
                color={palette.ink2}
                numberOfLines={2}
                style={styles.metaText}
              >
                {event.location}
              </AppText>
            </View>
          )}
          {!!event.organizationName && (
            <AppText
              variant="caption"
              color={palette.ink2}
              numberOfLines={2}
              style={styles.metaText}
            >
              {event.organizationName}
            </AppText>
          )}
          <View style={styles.chips}>
            {event.isPublic ? (
              <StatusChip
                kind="plain"
                label={`${t('card.public_tag')}`}
                icon={<GlobeIcon size={14} color={palette.navy} />}
                style={styles.plainChip}
              />
            ) : (
              <StatusChip
                kind="act"
                label={`${t('card.members_tag')}`}
                icon={<LockIcon size={14} color={palette.yellow} />}
              />
            )}
            {chip && <StatusChip kind={chip.kind} label={`${t(chip.key)}`} />}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default EventCard;

const styles = StyleSheet.create((theme) => ({
  card: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  standalone: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    padding: 10,
  },
  // inside the legacy Group, which pads the sides
  row: { paddingVertical: 12 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.line },
  dateBlock: {
    width: 60,
    minHeight: 84,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateBlockHero: { width: 76, minHeight: 100, borderRadius: 20, paddingVertical: 10 },
  dateSmall: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.7,
  },
  dateDay: {
    fontFamily: theme.fontFamily.display,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -1.2,
    fontVariant: ['tabular-nums'],
  },
  dateDayHero: { fontSize: 40, lineHeight: 42, letterSpacing: -1.6 },
  body: { flex: 1, gap: 3, paddingVertical: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  // the plain chip on a white card: a hairline so it still reads as a chip
  plainChip: { borderWidth: 1, borderColor: theme.colors.line },
}));
