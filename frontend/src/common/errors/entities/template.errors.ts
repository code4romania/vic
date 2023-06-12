import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum TEMPLATE_ERRORS {
  TEMPLATE_001 = 'TEMPLATE_001',
  TEMPLATE_002 = 'TEMPLATE_002',
}

export class TemplateError extends ErrorClass<TEMPLATE_ERRORS> {
  private static instance: TemplateError;

  private constructor() {
    super({
      [TEMPLATE_ERRORS.TEMPLATE_001]: i18n.t(
        'documents:template.add.form.submit.errors.TEMPLATE_001',
      ),
      [TEMPLATE_ERRORS.TEMPLATE_002]: i18n.t(
        'documents:template.edit.form.submit.errors.TEMPLATE_002',
      ),
    });
  }

  public static getInstance(): TemplateError {
    if (!TemplateError.instance) {
      TemplateError.instance = new TemplateError();
    }

    return TemplateError.instance;
  }
}
