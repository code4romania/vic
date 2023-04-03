import { ErrorClass } from '../base-error.class';

export enum ACTIONS_ERRORS {}

export class ActionsError extends ErrorClass<ACTIONS_ERRORS> {
  private static instance: ActionsError;

  private constructor() {
    super({});
  }

  public static getInstance(): ActionsError {
    if (!ActionsError.instance) {
      ActionsError.instance = new ActionsError();
    }

    return ActionsError.instance;
  }
}
