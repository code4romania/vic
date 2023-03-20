export enum ActivityLogStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ActivityLogStatusForSolvedLogs {
  APPROVED = ActivityLogStatus.APPROVED,
  REJECTED = ActivityLogStatus.REJECTED,
}
