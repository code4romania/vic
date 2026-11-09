// VIC 2.0, #488: signed and not past its end date, waiting for the signed copy, or past its end date.
export enum ClientContractStatus {
  SIGNED = 'SIGNED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}
