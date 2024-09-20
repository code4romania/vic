export type BaseDocumentContractActionsArchiveEvent = {
  organizationId: string;
  // organizationName: string; // TODO: This seems completly unnecessary to track
  documentContractId: string;
  documentContractNumber: string;
  volunteerId: string;
  volunteerName: string;
};
