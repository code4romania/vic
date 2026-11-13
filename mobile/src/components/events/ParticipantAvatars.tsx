import React from 'react';
import { Image, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EventParticipants } from '../../common/interfaces/event.interface';

/** at most this many faces by default, then the „+N” bubble */
const MAX_FACES = 3;

/**
 * Who is coming, like the handbook's `.avs`: overlapping 32pt circles with a 2pt white ring
 * (−8pt overlap), navy with yellow Manrope 800 initials (the picture when there is one), then a
 * „+N” bubble for the rest. The circles are fixed-size graphics, so their letters do not grow
 * with Dynamic Type; the row reads as one element: „18 persoane participă”.
 */
const ParticipantAvatars = ({
  participants,
  accessibilityLabel,
  max = MAX_FACES,
  testID = 'event-participants',
}: {
  participants?: EventParticipants | null;
  /** how many faces before „+N” (the API sends up to 5) */
  max?: number;
  accessibilityLabel: string;
  testID?: string;
}) => {
  const faces = (participants?.preview ?? []).slice(0, Math.max(1, max));
  if (!participants || participants.total <= 0 || faces.length === 0) {
    return null;
  }
  const more = Math.max(0, participants.total - faces.length);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {faces.map((face, index) => (
        <View
          key={`${index}-${face.initials}`}
          style={[styles.face, index > 0 ? styles.overlap : null]}
          testID={`${testID}-face`}
        >
          {face.avatarUrl ? (
            <Image
              source={{ uri: face.avatarUrl }}
              style={styles.photo}
              testID={`${testID}-photo`}
            />
          ) : (
            <Text allowFontScaling={false} numberOfLines={1} style={styles.initials}>
              {face.initials}
            </Text>
          )}
        </View>
      ))}
      {more > 0 && (
        <View style={[styles.face, styles.more, styles.overlap]} testID={`${testID}-more`}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.moreText}>
            {`+${more > 99 ? 99 : more}`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ParticipantAvatars;

const SIZE = 32;

const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlap: { marginLeft: -8 },
  photo: { width: '100%', height: '100%' },
  initials: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 12,
    lineHeight: 15,
    color: theme.colors.yellow,
    includeFontPadding: false,
  },
  // the rest: a light bubble in the same ring, so it reads as "and more", not as a person
  more: {
    width: undefined,
    minWidth: SIZE,
    paddingHorizontal: 5,
    backgroundColor: theme.colors.paper,
  },
  moreText: {
    fontFamily: theme.fontFamily.textHeavy,
    fontSize: 11.5,
    lineHeight: 15,
    color: theme.colors.navy,
    includeFontPadding: false,
  },
}));
