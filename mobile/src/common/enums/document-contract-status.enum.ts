export enum DocumentContractStatus {
  SCHEDULED = 'SCHEDULED', // Contract created by NGO, but scheduled to be sent to the volunteer
  PENDING_VOLUNTEER_SIGNATURE = 'PENDING_VOLUNTEER_SIGNATURE', // Waiting for volunteer signature
  PENDING_APPROVAL_NGO = 'PENDING_APPROVAL_NGO',
  PENDING_NGO_REPRESENTATIVE_SIGNATURE = 'PENDING_NGO_REPRESENTATIVE_SIGNATURE',
  REJECTED_VOLUNTEER = 'REJECTED_VOLUNTEER', // The volunteer rejected the contract
  REJECTED_NGO = 'REJECTED_NGO', // The NGO rejected the contract
  ACTION_EXPIRED = 'ACTION_EXPIRED', // The volunteer or NGO has not taken action for too long
  ACTIVE = 'ACTIVE', // The contract is approved and active
  EXPIRED = 'EXPIRED', // The contract is approved but expired
  NOT_STARTED = 'NOT_STARTED', // The contract is approved but did not start yet
}
