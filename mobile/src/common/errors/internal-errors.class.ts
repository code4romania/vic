import { AccessCodeErrors } from './entities/access-code';
import { AccessRequestErrors } from './entities/access-request';
import { UserErrors } from './entities/user.errors';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static USER_ERRORS = UserErrors.getInstance();
  public static ACCESS_REQUEST_ERRORS = AccessRequestErrors.getInstance();
  public static ACCESS_CODE_ERRORS = AccessCodeErrors.getInstance();
}
