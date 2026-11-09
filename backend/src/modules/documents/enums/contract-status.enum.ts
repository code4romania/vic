// VIC 2.0, #488: a contract is signed (ACTIVE) or not (INACTIVE). Whether it expired, or expires
// soon, is computed from its end date and never stored.
export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
