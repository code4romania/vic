import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum TemplateExceptionCodes {
  TEMPLATE_001 = 'TEMPLATE_001',
  TEMPLATE_002 = 'TEMPLATE_002',
  TEMPLATE_003 = 'TEMPLATE_003',
}

type TemplateExceptionCodeType = keyof typeof TemplateExceptionCodes;

export const TemplateExceptionMessages: Record<
  TemplateExceptionCodes,
  BusinessException<TemplateExceptionCodeType>
> = {
  [TemplateExceptionCodes.TEMPLATE_001]: {
    code_error: TemplateExceptionCodes.TEMPLATE_001,
    message: 'Error while uploading the template to s3',
  },
  [TemplateExceptionCodes.TEMPLATE_002]: {
    code_error: TemplateExceptionCodes.TEMPLATE_002,
    message: 'Template not found!',
  },
  [TemplateExceptionCodes.TEMPLATE_003]: {
    code_error: TemplateExceptionCodes.TEMPLATE_003,
    message: 'Could not delete the template file from s3!',
  },
};
