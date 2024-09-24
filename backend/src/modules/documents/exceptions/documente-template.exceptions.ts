import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum DocumentTemplateExceptionCodes {
  TEMPLATE_001 = 'TEMPLATE_001',
  TEMPLATE_002 = 'TEMPLATE_002',
  TEMPLATE_003 = 'TEMPLATE_003',
  TEMPLATE_004 = 'TEMPLATE_004',
  TEMPLATE_005 = 'TEMPLATE_005',
}

type DocumentTemplateExceptionCodeType =
  keyof typeof DocumentTemplateExceptionCodes;

export const DocumentTemplateExceptionMessages: Record<
  DocumentTemplateExceptionCodes,
  BusinessException<DocumentTemplateExceptionCodeType>
> = {
  [DocumentTemplateExceptionCodes.TEMPLATE_001]: {
    code_error: DocumentTemplateExceptionCodes.TEMPLATE_001,
    message: 'Not found',
  },
  [DocumentTemplateExceptionCodes.TEMPLATE_002]: {
    code_error: DocumentTemplateExceptionCodes.TEMPLATE_002,
    message: 'Error while creating the document template',
  },
  [DocumentTemplateExceptionCodes.TEMPLATE_003]: {
    code_error: DocumentTemplateExceptionCodes.TEMPLATE_003,
    message: 'Used templates cannot be deleted',
  },
  [DocumentTemplateExceptionCodes.TEMPLATE_004]: {
    code_error: DocumentTemplateExceptionCodes.TEMPLATE_004,
    message: 'Error while updating the document template',
  },
  [DocumentTemplateExceptionCodes.TEMPLATE_005]: {
    code_error: DocumentTemplateExceptionCodes.TEMPLATE_005,
    message: 'Error while deleting the document template',
  },
};
