import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IRegularUserProfileModel } from 'src/modules/user/models/regular-user.model';
import { OrganizationVolunteerPresenter } from '../../organization/presenters/organization-volunteer.presenter';
import { UserPresenter } from './user.presenter';

export class UserProfilePresenter extends UserPresenter {
  constructor(user: IRegularUserProfileModel) {
    super(user);
    this.myOrganizations = user.myOrganizations;
  }

  @Expose()
  @ApiProperty({
    isArray: true,
    type: OrganizationVolunteerPresenter,
  })
  myOrganizations: OrganizationVolunteerPresenter[];
}
