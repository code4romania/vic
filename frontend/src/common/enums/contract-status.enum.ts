// #488: what a contract shows: signed and not past its end date, or past its end date. Contracts
// are uploaded already signed (#486), so none is "În așteptare" (Maria, 27 Nov 2026).
export enum ContractStatus {
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

// #489: a filter and a counter, not a status a contract shows: signed contracts that end within
// 30 days. The server decides which ones (one rule with the "Expiră în curând" tag).
export const EXPIRING_SOON = 'EXPIRING_SOON';

export type ContractFilterStatus = ContractStatus | typeof EXPIRING_SOON;
