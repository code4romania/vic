import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { ClientContractStatus } from '../../common/enums/client-contract-status.enum';
import { colors, fonts, StatusTone } from '../../common/theme/tokens';
import { shortMonth } from '../../common/utils/event-format';
import { Badge, Chevron, PressableScale, VText } from '../ui';

const STATUS: Partial<Record<ClientContractStatus, { tone: StatusTone; label: string }>> = {
  [ClientContractStatus.PENDING_VOLUNTEER]: { tone: 'wait', label: 'status.PENDING_VOLUNTEER' },
  [ClientContractStatus.PENDING_ADMIN]: { tone: 'neutral', label: 'status.PENDING_ADMIN' },
  [ClientContractStatus.NOT_STARTED]: { tone: 'neutral', label: 'status.NOT_STARTED' },
  [ClientContractStatus.ACTIVE]: { tone: 'ok', label: 'status.ACTIVE' },
  [ClientContractStatus.CLOSED]: { tone: 'neutral', label: 'status.CLOSED' },
  [ClientContractStatus.REJECTED]: { tone: 'no', label: 'status.REJECTED' },
};

/** "15 ian 2025" */
export const formatContractDay = (value?: string | null) =>
  value
    ? `${format(new Date(value), 'd')} ${shortMonth(value)} ${format(new Date(value), 'y')}`
    : '';

export interface DocumentRowProps {
  contract: IContractListItem;
  onPress: (contract: IContractListItem) => void;
  /** pending contracts open the contract page; signed ones download */
  kind: 'pending' | 'signed';
  busy?: boolean;
  divider?: boolean;
}

/** A contract on Documente (canvas board "Documente"): file tile, number, period and status. */
export const DocumentRow = ({
  contract,
  onPress,
  kind,
  busy,
  divider = true,
}: DocumentRowProps) => {
  const { t } = useTranslation('documents');
  const status = STATUS[contract.status];
  const tone = colors.status[kind === 'pending' ? 'wait' : (status?.tone ?? 'neutral')];
  const period = [formatContractDay(contract.startDate), formatContractDay(contract.endDate)]
    .filter(Boolean)
    .join(' – ');
  const title = `${t('contract_prefix')} ${contract.contractNumber}`;
  return (
    <PressableScale
      onPress={() => onPress(contract)}
      disabled={busy}
      pressedScale={0.985}
      style={[styles.row, divider && styles.divider]}
      accessibilityLabel={`${title}, ${period}${kind === 'signed' ? `, ${t('download')}` : ''}`}
      testID={`document-row-${contract.id}`}
    >
      <View style={[styles.tile, { backgroundColor: tone.bg }]}>
        <VText style={[styles.tileText, { color: tone.fg }]}>
          {(contract.contractFileName?.split('.').pop() || 'pdf').toUpperCase()}
        </VText>
      </View>
      <View style={styles.text}>
        <VText variant="h3" style={styles.title} numberOfLines={1}>
          {title}
        </VText>
        <VText variant="cap" numberOfLines={1}>
          {period}
        </VText>
      </View>
      {status && <Badge label={`${t(status.label)}`} tone={status.tone} />}
      {busy ? <ActivityIndicator color={colors.navy} /> : kind === 'pending' && <Chevron />}
    </PressableScale>
  );
};

export default DocumentRow;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tile: {
    width: 44,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.4 },
  text: { flex: 1, gap: 3, minWidth: 0 },
  title: { fontSize: 15 },
});
