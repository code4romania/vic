import { ActivityCategoryError } from './entities/activty-category.errors';
import { AccessCodeError } from './entities/access-code.errors';
import { AccessRequestError } from './entities/access-request.errors';
import { DivisionError } from './entities/division.errors';
import { OrganizationError } from './entities/organization.errors';
import { VolunteerError } from './entities/volunteer.errors';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static ORGANIZATION_ERRORS = OrganizationError.getInstance();
  public static DIVISION_ERRORS = DivisionError.getInstance();
  public static VOLUNTEER_ERRORS = VolunteerError.getInstance();
  public static ACCESS_CODE_ERRORS = AccessCodeError.getInstance();
  public static ACTIVITY_CATEGORY_ERRORS = ActivityCategoryError.getInstance();
  public static ACCESS_REQUEST_ERRORS = AccessRequestError.getInstance();
}
