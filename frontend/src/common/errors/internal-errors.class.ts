import { AccessCodeError } from './entities/access-code.errors';
import { AccessRequestError } from './entities/access-request.errors';
import { ActivityLogError } from './entities/activity-log.errors';
import { ActivityTypeError } from './entities/activty-type.errors';
import { AnnouncementError } from './entities/announcement.errors';
import { DivisionError } from './entities/division.errors';
import { OrganizationError } from './entities/organization.errors';
import { VolunteerError } from './entities/volunteer.errors';
import { EventError } from './entities/event.errors';
import { ActionsError } from './entities/actions.errors';
import { TemplateError } from './entities/template.errors';
import { ContractError } from './entities/contract.errors';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static ORGANIZATION_ERRORS = OrganizationError.getInstance();
  public static DIVISION_ERRORS = DivisionError.getInstance();
  public static VOLUNTEER_ERRORS = VolunteerError.getInstance();
  public static ACCESS_CODE_ERRORS = AccessCodeError.getInstance();
  public static ACTIVITY_TYPE_ERRORS = ActivityTypeError.getInstance();
  public static ACCESS_REQUEST_ERRORS = AccessRequestError.getInstance();
  public static EVENT_ERRORS = EventError.getInstance();
  public static ANNOUNCEMENT_ERRORS = AnnouncementError.getInstance();
  public static ACTIVITY_LOG_ERRORS = ActivityLogError.getInstance();
  public static ACTIONS_ERRORS = ActionsError.getInstance();
  public static TEMPLATE_ERRORS = TemplateError.getInstance();
  public static CONTRACT_ERRORS = ContractError.getInstance();
}
