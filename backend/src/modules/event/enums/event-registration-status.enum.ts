// VIC 2.0 (#501): a "going" answer is a registration the NGO approves or rejects. Volunteers already in
// the organization and in the event's departments are approved automatically. null when not going.
export enum EventRegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
