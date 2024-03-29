import { AccessCodeErrors } from './entities/access-code';
import { AccessRequestErrors } from './entities/access-request';
import { ActivityLogErrors } from './entities/activity-log';
import { ContractErrors } from './entities/contract';
import { EventErrors } from './entities/event.errors';
import { OrganizationErrors } from './entities/organization.errors';
import { SettingsErrors } from './entities/settings.errors';
import { UserErrors } from './entities/user.errors';
import { VolunterProfileErrors } from './entities/volunteer-profile';

// Here we list all the group of errors for every page
export class InternalErrors {
  public static USER_ERRORS = UserErrors.getInstance();
  public static ACCESS_REQUEST_ERRORS = AccessRequestErrors.getInstance();
  public static ACCESS_CODE_ERRORS = AccessCodeErrors.getInstance();
  public static VOLUNTEER_PROFILE_ERRORS = VolunterProfileErrors.getInstance();
  public static EVENT_ERRORS = EventErrors.getInstance();
  public static ACTIVITY_LOG_ERRORS = ActivityLogErrors.getInstance();
  public static CONTRACT_ERRORS = ContractErrors.getInstance();
  public static ORGANIZATION_ERRORS = OrganizationErrors.getInstance();
  public static SETTINGS_ERRORS = SettingsErrors.getInstance();
}
