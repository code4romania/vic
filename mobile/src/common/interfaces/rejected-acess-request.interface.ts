export interface IRejectedAccessRequest {
  id: string;
  organizationName: string;
  organizationLogo: string;
  createdOn: Date;
  rejectionReason: string;
}
