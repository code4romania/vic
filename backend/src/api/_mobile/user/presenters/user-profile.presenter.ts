import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IRegularUserProfileModel } from 'src/modules/user/models/regular-user.model';
import { OrganizationVolunteerPresenter } from '../../organization/presenters/organization-volunteer.presenter';
import { UserPresenter } from './user.presenter';
import { Language } from 'src/modules/user/enums/user.enum';

export class UserProfilePresenter extends UserPresenter {
  constructor(user: IRegularUserProfileModel) {
    super(user);
    this.myOrganizations = user.myOrganizations;
    this.language = user.language ?? null;
  }

  @Expose()
  @ApiProperty({
    isArray: true,
    type: OrganizationVolunteerPresenter,
  })
  myOrganizations: OrganizationVolunteerPresenter[];

  @Expose()
  @ApiProperty({
    enum: Language,
    nullable: true,
    description:
      'The language of the app, the push notifications and the emails; null = not chosen yet',
  })
  language: Language | null;
}
