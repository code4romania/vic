// VIC 2.0, #488: what the web and the app show. SIGNED = active and not past its end date,
// PENDING = inactive and not past its end date, EXPIRED = past its end date.
export enum ClientContractStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}
