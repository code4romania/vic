import i18n from '../../config/i18n';
import { ErrorClass } from '../base-error.class';

export enum DIVISION_ERRORS {
  ORGANIZATION_STRUCTURE_001 = 'ORGANIZATION_STRUCTURE_001',
  ORGANIZATION_STRUCTURE_002 = 'ORGANIZATION_STRUCTURE_002',
}

export class DivisionError extends ErrorClass<DIVISION_ERRORS> {
  private static instance: DivisionError;

  private constructor() {
    super({
      [DIVISION_ERRORS.ORGANIZATION_STRUCTURE_001]: i18n.t(
        'division:errors.custom.ORGANIZATION_STRUCTURE_001',
      ),
      [DIVISION_ERRORS.ORGANIZATION_STRUCTURE_002]: i18n.t(
        'division:errors.custom.ORGANIZATION_STRUCTURE_002',
      ),
    });
  }

  public static getInstance(): DivisionError {
    if (!DivisionError.instance) {
      DivisionError.instance = new DivisionError();
    }

    return DivisionError.instance;
  }
}
