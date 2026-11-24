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
      [TEMPLATE_ERRORS.TEMPLATE_001]: 'documents:template.add.form.submit.errors.TEMPLATE_001',
      [TEMPLATE_ERRORS.TEMPLATE_002]: 'documents:template.edit.form.submit.errors.TEMPLATE_002',
      [TEMPLATE_ERRORS.TEMPLATE_003]: 'documents:templates.actions.delete.errors.TEMPLATE_003',
    });
  }

  public static getInstance(): TemplateError {
    if (!TemplateError.instance) {
      TemplateError.instance = new TemplateError();
    }

    return TemplateError.instance;
  }
}
