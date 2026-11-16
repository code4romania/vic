import React from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { fontScaleCap, palette } from '../../design/tokens';
import { AppText } from '../../design/components/Text';
import { ImpactHexagon } from '../../design/components/ImpactHexagon';
import { StripedSquare } from './StripedSquare';
import { useCountTo } from './useCountTo';

type LegendKey = 'approved' | 'pending' | 'rejected';

const SWATCH: Record<LegendKey, string | null> = {
  approved: palette.yellow,
  pending: null,
  rejected: palette.red,
};

export interface HoursSummaryProps {
  approved: number;
  pending: number;
  rejected: number;
  /** change it to count the approved hours again from 0 (each time the screen comes into view) */
  replay?: unknown;
}

/**
 * The Ore header card (`.hrsHead`): the impact hexagon (approved fill + pending stripes) beside a
 * legend of the hours per status in Bricolage 30.
 */
export const HoursSummary = ({ approved, pending, rejected, replay }: HoursSummaryProps) => {
  const { t } = useTranslation('activity_logs');
  const reduced = useReducedMotion();
  // prototype `counts()`: approved counts from 0 on each focus, pending from the number shown
  const approvedShown = useCountTo(approved || 0, { reduced, replay });
  const pendingShown = useCountTo(pending || 0, { reduced, fromZero: false });
  const items: { key: LegendKey; value: number; shown: number }[] = [
    { key: 'approved', value: approved || 0, shown: approvedShown },
    { key: 'pending', value: pending || 0, shown: pendingShown },
    { key: 'rejected', value: rejected || 0, shown: rejected || 0 },
  ];
  return (
    <View style={styles.card} testID="hours-summary">
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ImpactHexagon
          approved={approved || 0}
          pending={pending || 0}
          rejected={rejected || 0}
          size={120}
          // Ore: navy / white pending stripes (Acasă's navy card uses yellow on #012A40)
          tone="onLight"
          testID="impact-hexagon"
        />
      </View>
      <View style={styles.legend}>
        {items.map(({ key, value, shown }) => {
          // „1h respinsă”, „42h aprobate”
          const label = `${t(value === 1 && key !== 'pending' ? `totals.${key}_singular` : `totals.${key}`)}`;
          return (
            <View
              key={key}
              accessible
              accessibilityLabel={`${value}h ${label}`}
              testID={`hours-total-${key}`}
            >
              <AppText
                variant="title"
                style={styles.value}
                maxFontSizeMultiplier={fontScaleCap.display}
              >
                {`${shown}h`}
              </AppText>
              <View style={styles.key}>
                {SWATCH[key] ? (
                  <View style={[styles.square, { backgroundColor: SWATCH[key]! }]} />
                ) : (
                  <StripedSquare period={6} />
                )}
                <AppText variant="label" color={palette.ink2} style={styles.keyText}>
                  {label}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default HoursSummary;

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 14,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
  },
  legend: { flex: 1, gap: 8 },
  // `.legend .v`: Bricolage 800 30, line-height 1 (Bricolage needs ~0.9 in RN to sit as tight)
  value: {
    fontSize: 30,
    lineHeight: 28,
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  square: { width: 12, height: 12, borderRadius: 4 },
  keyText: { fontFamily: theme.fontFamily.textBold, fontSize: 12.5, lineHeight: 17, flexShrink: 1 },
}));
