// Documente „Îndrăzneț”: the contract that expires soonest as an orange card, the others as white
// rows with a status chip, their period and a validity bar that fills when the screen opens.
import React, { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { StyleSheet } from 'react-native-unistyles';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { ClientContractStatus } from '../../common/enums/client-contract-status.enum';
import { DocumentType } from '../../common/enums/document-type.enum';
import { shortMonth } from '../../common/utils/event-format';
import { romanianNeedsDe } from '../../common/utils/plural';
import { AppText } from '../../design/components/Text';
import { StatusChip, StatusKind } from '../../design/components/Chip';
import { AlertIcon, ArrowRightIcon, ICON_STROKE } from '../../design/icons';
import { palette } from '../../design/tokens';
import { PressableScale } from '../ui/PressableScale';

// #488: Semnat / În așteptare / Expirat; a signed contract in its last month shows "Expiră în curând"
const STATUS: Record<ClientContractStatus, { kind: StatusKind; label: string }> = {
  [ClientContractStatus.SIGNED]: { kind: 'ok', label: 'status.SIGNED' },
  [ClientContractStatus.PENDING]: { kind: 'wait', label: 'status.PENDING' },
  [ClientContractStatus.EXPIRED]: { kind: 'exp', label: 'status.EXPIRED' },
};

const DAY = 24 * 60 * 60 * 1000;
// an open-ended contract fills its bar over a year
const OPEN_ENDED_SPAN = 365 * DAY;
// handbook motion catalog: "Bare de progres", gentle · 1.1 s
const BAR_FILL_MS = 1100;
const GENTLE = Easing.bezier(0.25, 1, 0.35, 1);
// handbook .press:active scale(.965)
const PRESSED = 0.965;
// handbook .bar track (navy 18%); signed rows use the light paper track (.bar.light)
const NAVY_TRACK = 'rgba(1,52,79,0.18)';

/** "15 ian 2025" */
export const formatContractDay = (value?: string | null) =>
  value
    ? `${format(new Date(value), 'd')} ${shortMonth(value)} ${format(new Date(value), 'y')}`
    : '';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * How much of its validity a contract has used (0–1): expired contracts are full, open-ended ones
 * fill over a year, certificates have no bar (null).
 */
export const contractProgress = (contract: IContractListItem, now = Date.now()): number | null => {
  if (contract.type === DocumentType.CERTIFICATE) {
    return null;
  }
  if (contract.status === ClientContractStatus.EXPIRED) {
    return 1;
  }
  const start = Date.parse(contract.startDate);
  if (Number.isNaN(start)) {
    return 0;
  }
  const end = contract.endDate ? Date.parse(contract.endDate) : NaN;
  if (Number.isNaN(end)) {
    return clamp01((now - start) / OPEN_ENDED_SPAN);
  }
  return end > start ? clamp01((now - start) / (end - start)) : 1;
};

/** Whole days until the end date (0 once it passed), or null without an end date. */
export const daysLeft = (contract: IContractListItem, now = Date.now()): number | null => {
  const end = contract.endDate ? Date.parse(contract.endDate) : NaN;
  return Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - now) / DAY));
};

/** The contract that expires soonest among the ones marked "expiră în curând" (#488). */
export const pickExpiringSoon = (contracts: IContractListItem[]) =>
  contracts
    .filter((contract) => contract.expiringSoon && daysLeft(contract) !== null)
    .sort((a, b) => Date.parse(a.endDate as string) - Date.parse(b.endDate as string))[0];

/**
 * „activ de 33 de zile” for a signed open-ended contract that already started (handbook row:
 * „Din 10 oct 2026 · fără dată de final · activ de 33 de zile”); empty otherwise.
 */
const activeFor = (contract: IContractListItem, t: (key: string, options?: any) => string) => {
  const start = Date.parse(contract.startDate);
  if (contract.status !== ClientContractStatus.SIGNED || Number.isNaN(start)) {
    return '';
  }
  const days = Math.floor((Date.now() - start) / DAY);
  if (days < 1) {
    return '';
  }
  if (days === 1) {
    return `${t('active_for_one')}`;
  }
  return `${t(romanianNeedsDe(days) ? 'active_for_de' : 'active_for', { count: days })}`;
};

const useContractTexts = (contract: IContractListItem) => {
  const { t } = useTranslation('documents');
  // #490: a certificate is issued on a day and never expires
  const isCertificate = contract.type === DocumentType.CERTIFICATE;
  const period = isCertificate
    ? `${t('issued_on', { date: formatContractDay(contract.startDate) })}`
    : contract.endDate
      ? `${formatContractDay(contract.startDate)} – ${formatContractDay(contract.endDate)}`
      : [
          `${t('period_open', { start: formatContractDay(contract.startDate) })}`,
          activeFor(contract, t),
        ]
          .filter(Boolean)
          .join(' · ');
  const prefix = t(isCertificate ? 'certificate_prefix' : 'contract_prefix');
  const title = contract.contractNumber ? `${prefix} ${contract.contractNumber}` : `${prefix}`;
  return { t, period, title };
};

/**
 * The validity bar (10pt, radius 5). It fills from empty every time the screen comes into focus,
 * with the gentle curve over 1.1 s; with Reduce Motion it is full at once.
 */
export const ValidityBar = ({
  progress,
  fill,
  track,
  testID,
}: {
  progress: number;
  fill: string;
  track: string;
  testID?: string;
}) => {
  const reduced = useReducedMotion();
  const value = useSharedValue(reduced ? progress : 0);
  useFocusEffect(
    useCallback(() => {
      if (reduced) {
        value.value = progress;
        return;
      }
      value.value = 0;
      value.value = withTiming(progress, { duration: BAR_FILL_MS, easing: GENTLE });
    }, [progress, reduced, value]),
  );
  const fillStyle = useAnimatedStyle(() => ({ width: `${value.value * 100}%` }));
  return (
    <View
      style={[styles.bar, { backgroundColor: track }]}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.barFill, { backgroundColor: fill }, fillStyle]} />
    </View>
  );
};

export interface DocumentRowProps {
  contract: IContractListItem;
  /** downloads the contract */
  onPress: (contract: IContractListItem) => void;
  busy?: boolean;
}

/** A contract or a certificate as a white row: title and status chip, period, validity bar. */
export const DocumentRow = ({ contract, onPress, busy }: DocumentRowProps) => {
  const { t, period, title } = useContractTexts(contract);
  const status = contract.expiringSoon
    ? { kind: 'soon' as StatusKind, label: 'expiring_soon' }
    : STATUS[contract.status];
  const expired = contract.status === ClientContractStatus.EXPIRED;
  const progress = contractProgress(contract);
  const fill =
    contract.status === ClientContractStatus.SIGNED
      ? palette.green
      : expired
        ? palette.slate
        : palette.navy;
  return (
    <PressableScale
      onPress={() => onPress(contract)}
      disabled={busy}
      pressedScale={PRESSED}
      style={styles.row}
      accessibilityLabel={`${title}, ${status ? `${t(status.label)}, ` : ''}${period}, ${t('download')}`}
      testID={`document-row-${contract.id}`}
    >
      <View style={styles.rowHead}>
        <AppText
          variant="headline"
          color={expired ? palette.ink2 : palette.ink}
          style={styles.rowTitle}
        >
          {title}
        </AppText>
        {busy ? (
          <ActivityIndicator color={palette.navy} testID={`document-busy-${contract.id}`} />
        ) : (
          status && (
            <StatusChip label={`${t(status.label)}`} kind={status.kind} style={styles.chip} />
          )
        )}
      </View>
      <AppText variant="caption" color={palette.ink2} style={styles.period}>
        {period}
      </AppText>
      {progress !== null && (
        <ValidityBar
          progress={progress}
          fill={fill}
          track={contract.status === ClientContractStatus.SIGNED ? palette.paper : NAVY_TRACK}
          testID={`document-bar-${contract.id}`}
        />
      )}
    </PressableScale>
  );
};

/** The contract that expires soonest: orange card, days left in Bricolage 46, navy bar. */
export const FeaturedContract = ({ contract, onPress, busy }: DocumentRowProps) => {
  const { t, period, title } = useContractTexts(contract);
  const days = daysLeft(contract) ?? 0;
  const remaining =
    days === 1
      ? `${t('days_left_one')}`
      : `${t(romanianNeedsDe(days) ? 'days_left_de' : 'days_left', { count: days })}`;
  return (
    <PressableScale
      onPress={() => onPress(contract)}
      disabled={busy}
      pressedScale={PRESSED}
      style={styles.feature}
      accessibilityLabel={`${title}, ${t('expiring_soon')}, ${remaining}, ${period}, ${t('download')}`}
      testID={`document-row-${contract.id}`}
    >
      <View style={styles.featureHead}>
        <StatusChip
          kind="act"
          label={`${t('expiring_soon')}`}
          icon={<AlertIcon size={14} color={palette.yellow} strokeWidth={2.5} />}
        />
        {!!contract.contractNumber && (
          <AppText variant="overline" color={palette.navy} style={styles.number}>
            {contract.contractNumber}
          </AppText>
        )}
      </View>
      <AppText
        variant="display"
        color={palette.navy}
        style={styles.big}
        testID="document-days-left"
      >
        {remaining}
      </AppText>
      <AppText variant="label" color={palette.navy} style={styles.featureDates}>
        {period}
      </AppText>
      <ValidityBar
        progress={contractProgress(contract) ?? 1}
        fill={palette.navy}
        track={NAVY_TRACK}
        testID={`document-bar-${contract.id}`}
      />
      <View style={styles.featureFoot}>
        <AppText variant="label" color={palette.navy} style={styles.featureAction}>
          {t('featured_action')}
        </AppText>
        <View style={styles.go}>
          {busy ? (
            <ActivityIndicator color={palette.yellow} testID={`document-busy-${contract.id}`} />
          ) : (
            <ArrowRightIcon size={20} color={palette.yellow} strokeWidth={ICON_STROKE + 0.5} />
          )}
        </View>
      </View>
    </PressableScale>
  );
};

export default DocumentRow;

const styles = StyleSheet.create((theme) => ({
  row: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.row,
    padding: theme.space.l,
  },
  rowHead: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space.s },
  // the title wraps (never clips) beside the 28pt chip; 4pt centres one line on the chip
  rowTitle: { flex: 1, minWidth: 0, paddingTop: 4 },
  chip: { flexShrink: 0, maxWidth: '60%' },
  period: { marginTop: 2, fontVariant: ['tabular-nums'] },
  bar: { height: 10, borderRadius: 5, overflow: 'hidden', marginTop: theme.space.m },
  barFill: { position: 'absolute', top: 0, bottom: 0, left: 0, borderRadius: 5 },
  feature: {
    backgroundColor: theme.colors.orange,
    borderRadius: 28,
    padding: 16,
  },
  featureHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.s,
  },
  number: { flexShrink: 1 },
  // handbook .docfeat .big: Bricolage 46, line height .9 (41.4 → 42), -.04em, margin 10 0 4.
  // The display variant caps Dynamic Type at 1.15× and brings tabular numbers; a long count
  // („30 de zile rămase”) wraps to a second line instead of shrinking.
  big: {
    fontSize: 46,
    lineHeight: 42,
    letterSpacing: -1.84,
    marginTop: 10,
    marginBottom: 4,
    includeFontPadding: false,
  },
  // handbook: Manrope 700 13.5 for the period, 700 13 for the action
  featureDates: {
    fontFamily: theme.fontFamily.textBold,
    fontSize: 13.5,
    lineHeight: 18,
    fontVariant: ['tabular-nums'],
  },
  featureFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space.m,
    marginTop: theme.space.m,
  },
  featureAction: { flex: 1, minWidth: 0, fontFamily: theme.fontFamily.textBold },
  go: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
