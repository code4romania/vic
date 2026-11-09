import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';
import { ClientContractStatus } from '../../common/enums/client-contract-status.enum';
import { DocumentType } from '../../common/enums/document-type.enum';
import { colors, fonts, StatusTone } from '../../common/theme/tokens';
import { shortMonth } from '../../common/utils/event-format';
import { Badge, PressableScale, VText } from '../ui';

// #488: Semnat / În așteptare / Expirat; a signed contract in its last month shows "Expiră în curând"
const STATUS: Record<ClientContractStatus, { tone: StatusTone; label: string }> = {
  [ClientContractStatus.SIGNED]: { tone: 'ok', label: 'status.SIGNED' },
  [ClientContractStatus.PENDING]: { tone: 'wait', label: 'status.PENDING' },
  [ClientContractStatus.EXPIRED]: { tone: 'neutral', label: 'status.EXPIRED' },
};

/** "15 ian 2025" */
export const formatContractDay = (value?: string | null) =>
  value
    ? `${format(new Date(value), 'd')} ${shortMonth(value)} ${format(new Date(value), 'y')}`
    : '';

export interface DocumentRowProps {
  contract: IContractListItem;
  /** downloads the contract */
  onPress: (contract: IContractListItem) => void;
  busy?: boolean;
  divider?: boolean;
}

/** A contract or a certificate on Documente (canvas board "Documente"): file tile, number, period and status. */
export const DocumentRow = ({ contract, onPress, busy, divider = true }: DocumentRowProps) => {
  const { t } = useTranslation('documents');
  const status = contract.expiringSoon
    ? { tone: 'wait' as StatusTone, label: 'expiring_soon' }
    : STATUS[contract.status];
  const tone = colors.status[status?.tone ?? 'neutral'];
  // #490: a certificate is issued on a day and never expires
  const isCertificate = contract.type === DocumentType.CERTIFICATE;
  const period = isCertificate
    ? `${t('issued_on', { date: formatContractDay(contract.startDate) })}`
    : contract.endDate
      ? `${formatContractDay(contract.startDate)} – ${formatContractDay(contract.endDate)}`
      : `${t('period_open', { start: formatContractDay(contract.startDate) })}`;
  const prefix = t(isCertificate ? 'certificate_prefix' : 'contract_prefix');
  const title = contract.contractNumber ? `${prefix} ${contract.contractNumber}` : `${prefix}`;
  return (
    <PressableScale
      onPress={() => onPress(contract)}
      disabled={busy}
      pressedScale={0.985}
      style={[styles.row, divider && styles.divider]}
      accessibilityLabel={`${title}, ${period}, ${t('download')}`}
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
      {busy && <ActivityIndicator color={colors.navy} />}
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
