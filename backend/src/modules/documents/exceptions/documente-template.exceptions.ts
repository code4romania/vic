import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum DocumentTemplateExceptionCodes {
  TEMPLATE_001 = 'TEMPLATE_001',
  TEMPLATE_002 = 'TEMPLATE_002',
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
};
