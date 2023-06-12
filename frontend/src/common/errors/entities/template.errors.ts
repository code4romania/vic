import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum TEMPLATE_ERRORS {
  TEMPLATE_001 = 'TEMPLATE_001',
  TEMPLATE_002 = 'TEMPLATE_002',
  TEMPLATE_003 = 'TEMPLATE_003',
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
      [TEMPLATE_ERRORS.TEMPLATE_003]: i18n.t(
        'documents:templates.actions.delete.errors.TEMPLATE_003',
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
