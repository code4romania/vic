import { ErrorClass } from '../base-error.class';

export enum ACTIVITY_CATEGORY_ERRORS {}

export class ActivityCategoryError extends ErrorClass<ACTIVITY_CATEGORY_ERRORS> {
  private static instance: ActivityCategoryError;

  private constructor() {
    super({});
  }

  public static getInstance(): ActivityCategoryError {
    if (!ActivityCategoryError.instance) {
      ActivityCategoryError.instance = new ActivityCategoryError();
    }

    return ActivityCategoryError.instance;
  }
}
