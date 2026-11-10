// #488: what a contract shows. Signed and not past its end date, waiting for the signed copy, or past its end date.
export enum ContractStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

// #489: a filter and a counter, not a status a contract shows: signed contracts that end within
// 30 days. The server decides which ones (one rule with the "Expiră în curând" tag).
export const EXPIRING_SOON = 'EXPIRING_SOON';

export type ContractFilterStatus = ContractStatus | typeof EXPIRING_SOON;
