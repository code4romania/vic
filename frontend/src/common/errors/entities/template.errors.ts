import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum TEMPLATE_ERRORS {
  TEMPLATE_001 = 'TEMPLATE_001',
}

export class TemplateError extends ErrorClass<TEMPLATE_ERRORS> {
  private static instance: TemplateError;

  private constructor() {
    super({
      [TEMPLATE_ERRORS.TEMPLATE_001]: i18n.t(
        'documents:template.add.form.submit.errors.TEMPLATE_001',
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
