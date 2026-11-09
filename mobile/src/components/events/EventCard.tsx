import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EventRegistrationStatus } from '../../common/enums/event-registration-status.enum';
import { IEventListItem } from '../../common/interfaces/event-list-item.interface';
import { colors, fonts, radius } from '../../common/theme/tokens';
import { dateTile, formatEventWhen } from '../../common/utils/event-format';
import { Badge, PressableScale, VText } from '../ui';

export type EventCardItem = IEventListItem;

export interface EventCardProps {
  event: EventCardItem;
  onPress: (eventId: string) => void;
  /** Mark as joined even when the item has no isGoing (e.g. the "Particip" tab). */
  going?: boolean;
}

/**
 * Event row: a date tile (events have no poster since #492), the title, when and where, and who
 * organizes it. "Înscris" when the volunteer is going, "În așteptare" while the organization still has to
 * approve the registration, "Încheiat" once it's over.
 */
export const EventCard = ({ event, onPress, going }: EventCardProps) => {
  const { t } = useTranslation('events');
  const tile = dateTile(event.startDate);
  const isGoing = going || event.isGoing;
  const finished = event.displayStatus === 'finished';
  const pending = event.registrationStatus === EventRegistrationStatus.PENDING;
  const audience = event.isPublic ? t('card.public') : t('card.members');
  const meta = [event.organizationName, audience].filter(Boolean).join(' · ');

  return (
    <PressableScale
      onPress={() => onPress(event.id)}
      pressedScale={0.985}
      accessibilityLabel={`${event.name}, ${formatEventWhen(event.startDate, event.endDate)}`}
      style={styles.card}
      testID={`event-card-${event.id}`}
    >
      <View style={[styles.tile, finished ? styles.tileMuted : null]}>
        <VText style={styles.tileDay}>{tile.day}</VText>
        <VText variant="cap" color={finished ? colors.muted : colors.navy} style={styles.tileMonth}>
          {tile.month}
        </VText>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <VText variant="h3" numberOfLines={2} style={styles.title}>
            {event.name}
          </VText>
          {pending && !finished && <Badge label={t('card.pending')} tone="wait" />}
          {isGoing && !pending && !finished && <Badge label={t('card.going')} tone="ok" />}
          {finished && <Badge label={t('card.finished')} tone="neutral" />}
        </View>
        <VText variant="sub" numberOfLines={1}>
          {[formatEventWhen(event.startDate, event.endDate), event.location]
            .filter(Boolean)
            .join(' · ')}
        </VText>
        <VText variant="cap" numberOfLines={1}>
          {meta}
        </VText>
      </View>
    </PressableScale>
  );
};

export default EventCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tile: {
    width: 56,
    height: 64,
    borderRadius: radius.card - 2,
    backgroundColor: '#FFF6CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileMuted: { backgroundColor: colors.soft },
  tileDay: { fontFamily: fonts.title, fontSize: 24, lineHeight: 26, color: colors.navy },
  tileMonth: { fontFamily: fonts.bold, letterSpacing: 0.5 },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1 },
});
