// VIC 2.0, #488: what the web and the app show. SIGNED = signed and not past its end date,
// EXPIRED = past its end date. Contracts are uploaded already signed (#486), so nothing is
// "În așteptare" any more (Maria, 27 Nov 2026); the unsigned ones carried over from VIC 1 are
// left out of every list and counter.
export enum ClientContractStatus {
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
  // #489: a filter (and a counter), not a status of its own: SIGNED contracts within
  // EXPIRING_SOON_DAYS of their end date. A contract is never mapped to it.
  EXPIRING_SOON = 'EXPIRING_SOON',
}
