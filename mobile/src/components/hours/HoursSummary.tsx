import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { fontScaleCap, palette } from '../../design/tokens';
import { AppText } from '../../design/components/Text';
import { ImpactHexagon } from '../../design/components/ImpactHexagon';

/** 12×12 legend square with navy / white diagonal stripes (pending hours in the hexagon). */
const StripedSquare = () => {
  const id = `legend-stripes-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={6}
          height={6}
          patternTransform="rotate(45)"
        >
          <Rect x={0} y={0} width={3} height={6} fill={palette.navy} />
          <Rect x={3} y={0} width={3} height={6} fill={palette.white} />
        </Pattern>
      </Defs>
      <Rect x={0.5} y={0.5} width={11} height={11} rx={4} fill={`url(#${id})`} />
    </Svg>
  );
};

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
  /** change it to empty and refill the hexagon (e.g. after sending new hours) */
  refillKey?: number;
}

/**
 * The Ore header card (`.hrsHead`): the impact hexagon (approved fill + pending stripes) beside a
 * legend of the hours per status in Bricolage 30.
 */
export const HoursSummary = ({ approved, pending, rejected, refillKey = 0 }: HoursSummaryProps) => {
  const { t } = useTranslation('activity_logs');
  const items: { key: LegendKey; value: number }[] = [
    { key: 'approved', value: approved || 0 },
    { key: 'pending', value: pending || 0 },
    { key: 'rejected', value: rejected || 0 },
  ];
  return (
    <View style={styles.card} testID="hours-summary">
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ImpactHexagon
          key={refillKey}
          approved={approved || 0}
          pending={pending || 0}
          rejected={rejected || 0}
          size={120}
          testID="impact-hexagon"
        />
      </View>
      <View style={styles.legend}>
        {items.map(({ key, value }) => {
          const label = `${t(`totals.${key}`)}`;
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
                {`${value}h`}
              </AppText>
              <View style={styles.key}>
                {SWATCH[key] ? (
                  <View style={[styles.square, { backgroundColor: SWATCH[key]! }]} />
                ) : (
                  <StripedSquare />
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
  value: {
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
  },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  square: { width: 12, height: 12, borderRadius: 4 },
  keyText: { fontFamily: theme.fontFamily.textBold, fontSize: 12.5, flexShrink: 1 },
}));
