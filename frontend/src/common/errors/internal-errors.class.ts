import { DivisionError } from './entities/division.errors';
import { OrganizationError } from './entities/organization.errors';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static ORGANIZATION_ERRORS = OrganizationError.getInstance();
  public static DIVISION_ERRORS = DivisionError.getInstance();
}
