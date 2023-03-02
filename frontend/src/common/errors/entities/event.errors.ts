import { ErrorClass } from '../base-error.class';

export enum EVENT_ERRORS {}

export class EventError extends ErrorClass<EVENT_ERRORS> {
  private static instance: EventError;

  private constructor() {
    super({});
  }

  public static getInstance(): EventError {
    if (!EventError.instance) {
      EventError.instance = new EventError();
    }

    return EventError.instance;
  }
}
