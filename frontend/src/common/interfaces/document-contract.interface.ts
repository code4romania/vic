export interface IAddDocumentContractDTO {
  documentNumber: string;
  documentDate: Date;
  documentStartDate: Date;
  documentEndDate: Date;
  volunteerId: string;
  documentTemplateId: string;
  status: 'CREATED';
}
