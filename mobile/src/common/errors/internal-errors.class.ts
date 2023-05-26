import { UserErrors } from './entities/user.errors';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static USER_ERRORS = UserErrors.getInstance();
}
