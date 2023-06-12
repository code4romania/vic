import { BusinessException } from 'src/common/interfaces/business-exception.interface';

export enum TemplateExceptionCodes {
  TEMPLATE_001 = 'TEMPLATE_001',
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
};
