// VIC 2.0, #488: what the web and the app show. SIGNED = active and not past its end date,
// PENDING = inactive and not past its end date, EXPIRED = past its end date.
export enum ClientContractStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  // #489: a filter (and a counter), not a status of its own: SIGNED contracts within
  // EXPIRING_SOON_DAYS of their end date. A contract is never mapped to it.
  EXPIRING_SOON = 'EXPIRING_SOON',
}
