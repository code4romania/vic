import { ErrorClass } from '../base-error.class';

export enum DISVISION_ERRORS {}

export class DivisionError extends ErrorClass<DISVISION_ERRORS> {
  private static instance: DivisionError;

  private constructor() {
    super({});
  }

  public static getInstance(): DivisionError {
    if (!DivisionError.instance) {
      DivisionError.instance = new DivisionError();
    }

    return DivisionError.instance;
  }
}
