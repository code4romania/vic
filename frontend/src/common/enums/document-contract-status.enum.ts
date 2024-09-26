export enum DocumentContractStatus {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  PENDING_VOLUNTEER_SIGNATURE = 'PENDING_VOLUNTEER_SIGNATURE',
  PENDING_APPROVAL_NGO = 'PENDING_APPROVAL_NGO',
  PENDING_NGO_REPRESENTATIVE_SIGNATURE = 'PENDING_NGO_REPRESENTATIVE_SIGNATURE',
  APPROVED = 'APPROVED',
  REJECTED_VOLUNTEER = 'REJECTED_VOLUNTEER',
  REJECTED_NGO = 'REJECTED_NGO',
  ACTION_EXPIRED = 'ACTION_EXPIRED',
}

export enum DocumentContractStatusForFilter {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  PENDING_VOLUNTEER_SIGNATURE = 'PENDING_VOLUNTEER_SIGNATURE',
  PENDING_APPROVAL_NGO = 'PENDING_APPROVAL_NGO',
  PENDING_NGO_REPRESENTATIVE_SIGNATURE = 'PENDING_NGO_REPRESENTATIVE_SIGNATURE',
  REJECTED_VOLUNTEER = 'REJECTED_VOLUNTEER',
  REJECTED_NGO = 'REJECTED_NGO',
  ACTION_EXPIRED = 'ACTION_EXPIRED',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  NOT_STARTED = 'NOT_STARTED',
}
